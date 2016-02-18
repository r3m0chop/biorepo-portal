import socket
import json
import logging

from django.http import HttpResponse, HttpResponseRedirect, Http404,\
    HttpResponseForbidden
from django.template import RequestContext, loader
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import get_cache
from portal.forms.subject_forms import NewSubjectForm, EditSubjectForm
from portal.ehb_service_client import ServiceClient
from portal.models.protocols import Protocol, ProtocolDataSource,\
    Organization, ProtocolUserCredentials, ProtocolDataSourceLink
from portal.utilities import SubjectUtils, DriverUtils
from django.db import IntegrityError
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from ehb_client.requests.exceptions import ErrorConstants, PageNotFound
from ehb_client.requests.base import RequestBase
from ehb_client.requests.external_record_request_handler import ExternalRecord
from ehb_client.requests.subject_request_handler import Subject
from ehb_datasources.drivers.exceptions import RecordDoesNotExist,\
    RecordCreationError, IgnoreEhbExceptions

cache = get_cache('default')

log = logging.getLogger(__name__)


def forbidden(request, template_name='403.html'):
    '''Default 403 handler'''
    t = loader.get_template(template_name)
    return HttpResponseForbidden(t.render(RequestContext(request)))


def connectionRefused(func):
    def callfunc(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except socket.error:
            return HttpResponse('The system was unable to connect to either the eHB service or another datasource.')
    return callfunc

@login_required
def index(request):
    protocols = []
    # find the protocols for this user
    usr = request.user
    token = ''
    for p in Protocol.objects.all():
        if request.user in p.users.all():
            protocols.append(p)

    if isinstance(usr, User):
        try:
            token = Token.objects.create(user=usr)
        except IntegrityError:
            token = Token.objects.get(user=usr)

    return render_to_response(
        'welcome.html',
        {
            'user': usr,
            'token': token,
            'protocols': protocols,
            'root_path': ServiceClient.self_root_path,
            'redcap_status': getRedcapStatus()
        }, context_instance=RequestContext(request))



def getRedcapStatus():
    redcap_resp = cache.get('redcap_status')
    if redcap_resp:
        if int(redcap_resp) < 1000:
            return 'Good'
        if int(redcap_resp) > 1000 and int(redcap_resp) < 10000:
            return 'Moderate'
        if int(redcap_resp) > 10000:
            return 'Unresponsive'
    return 'Unavailable'


def filterLabels(pds, labels):
    try:
        config = json.loads(pds.driver_configuration)
        lbl_set = []
        for label in labels:
            if int(label['id']) in config['labels']:
                lbl_set.append(label)
    except:
        return [{"id": 1, "label": "Record"}]
    return lbl_set


@login_required
@connectionRefused
def pds_dataentry_start(request, pds_id, subject_id, record_id):
    '''
    Renders a page with the start page for the protocol_data_source with
    id = pds_id for the Subject with ehb-service id = subject_id. The exact
    form of this page is protocol_data_source dependent as determined by the
    driver
    '''

    def generateSubRecordSelectionForm(
            driver, record_id, form_url, print_url, attempt_count,
            max_attempts, allow_print=False, allow_zpl=False,
            allow_chop_print=False):
        try:
            return driver.subRecordSelectionForm(
                form_url=form_url,
                print_url=print_url,
                allow_print=allow_print,
                allow_zpl=allow_zpl,
                allow_chop_print=allow_chop_print,
                record_id=record_id
            )
        except RecordDoesNotExist:
            return None

    pds = getProtocolDataSource(pds_id)
    if not pds.protocol.isUserAuthorized(request.user):
        return forbidden(request)

    MANAGE_EXTERNAL_IDS = False
    # Check to see if this PDS is managing external identifiers
    for _pds in pds.protocol.getProtocolDataSources():
        if _pds.driver == 3:
            ExIdSource = _pds
            MANAGE_EXTERNAL_IDS = True

    subject = getPDSSubject(pds=pds, sub_id=subject_id)

    # If we are managing external identifiers add them to the subject
    if MANAGE_EXTERNAL_IDS:
        subject.external_ids = getExternalIdentifiers(ExIdSource, subject)

    er_rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_RECORD)
    record = None  # this will be the ehb-service externalRecord for this pds, subject NOT the actual datasource record
    error_msgs = []
    # get the record from the ehb with this record id and verify that it is in
    # the protocol data source for this subject
    try:
        pds_records = er_rh.get(
            external_system_url=pds.data_source.url, path=pds.path, subject_id=subject.id)
        record = er_rh.get(id=record_id)
        if record and pds_records:
            if record not in pds_records:
                raise Http404
        else:
            raise Http404
    except PageNotFound:
        raise Http404

    # if a proper record exists, get the html from the driver and display it
    if record:
        try:
            o_rh = ServiceClient.get_rh_for(
                record_type=ServiceClient.ORGANIZATION)
            er_label_rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_RECORD_LABEL)
            org = o_rh.get(id=subject.organization_id)
            driver = DriverUtils.getDriverFor(
                protocol_data_source=pds, user=request.user)

            form_url = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/form_spec/' % (
                ServiceClient.self_root_path,
                pds.id,
                subject_id,
                record_id)
            print_url = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/print/' % (
                ServiceClient.self_root_path,
                pds.id,
                subject_id,
                record_id)

            creds = ProtocolUserCredentials.objects.get(
                protocol=pds.protocol,
                user=request.user,
                data_source=pds
            )

            srsf = generateSubRecordSelectionForm(
                driver,
                record.record_id,
                form_url,
                print_url,
                0,
                1,
                allow_print=creds.allow_label_printing,
                allow_zpl=creds.allow_zpl_export,
                allow_chop_print=creds.allow_chop_printing
            )
            label = er_label_rh.get(id=record.label_id)
            if srsf:
                authorized_sources, unauthorized_sources = _auth_unauth_source_lists(
                    pds.protocol, request.user, pds)
                context = {
                    'subRecordSelectionForm': srsf,
                    'protocol': pds.protocol,
                    'authorized_data_sources': authorized_sources,
                    'unauthorized_data_sources': unauthorized_sources,
                    'organization': org,
                    'subject': subject,
                    'root_path': ServiceClient.self_root_path,
                    'pds_id': pds.id,
                    'label': label,
                    'redcap_status': getRedcapStatus()
                }
                return render_to_response(
                    'pds_dataentry_start.html',
                    context,
                    context_instance=RequestContext(request)
                )
            else:
                # the ehb has a record id, but the records wasn't created in
                # the external system.
                error_msgs.append(
                    'No record exists in the data source with the record id supplied by the eHB.')

        except ProtocolUserCredentials.DoesNotExist:
            log.error(
                'User {0} attempted access on {1}. Credentials not found'.format(
                    request.user,
                    pds.data_source.name))
            error_msgs.append((
                    'Your user credentials were not found for'
                    ' %s. Please contact system administrator.') % (
                    pds.data_source.name))
    '''
    Either multiple records exist in the ehb-service for this
    system/path/subject and hence proper record cannot be identified # OR the
    record does not exist and creation of the record failed
    '''
    return HttpResponse(' '.join(error_msgs))


def _create_external_system_record(request, driver, pds, subject, record_id=None, label=None):
    grp = SubjectUtils.get_protocol_subject_record_group(pds.protocol, subject)
    if grp:
        rec_id_prefix = grp.ehb_key
    else:
        log.error("No subject record group found")
        raise Exception('No subject record group found')
    rec_id = None

    def rec_id_validator(new_record_id):
        return SubjectUtils.validate_new_record_id(pds, subject, new_record_id)

    if record_id:
        if record_id.startswith(rec_id_prefix):
            rec_id = driver.create(
                record_id_prefix=None, record_id=record_id, record_id_validator=rec_id_validator)
        else:
            rec_id = driver.create(
                record_id_prefix=rec_id_prefix, record_id=record_id)
    else:
        rec_id = driver.create(
            record_id_prefix=rec_id_prefix, record_id_validator=rec_id_validator)
    notify_record_creation_listeners(
        driver, rec_id, pds, request.user, subject.id)
    er = SubjectUtils.create_new_ehb_external_record(
        pds, request.user, subject, rec_id, label)
    return er.id


@login_required
@connectionRefused
def pds_dataentry_create(request, pds_id, subject_id):
    '''renders a page with a data record creation form as generated by the driver for protocol_data_source with pk=pds_id
    for Subject with subject_id=subject_id. The specific record creation form is driver dependent - and not all drivers
    implement the form.'''

    pds = getProtocolDataSource(pk=pds_id)
    log.info('Attempting record creation for {0} on Protocol Datasource {1}'.format(subject_id, pds_id))

    MANAGE_EXTERNAL_IDS = False
    # Check to see if this PDS is managing external identifiers
    for _pds in pds.protocol.getProtocolDataSources():
        if _pds.driver == 3:
            ExIdSource = _pds
            MANAGE_EXTERNAL_IDS = True

    subject = getPDSSubject(pds=pds, sub_id=subject_id)

    # If we are managing external identifiers add them to the subject
    if MANAGE_EXTERNAL_IDS:
        subject.external_ids = getExternalIdentifiers(ExIdSource, subject)

    es_url = pds.data_source.url
    # get record ids for this protocol, subject, data source combination
    er_rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_RECORD)
    er_label_rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_RECORD_LABEL)
    allow_more_records = False

    try:
        records = er_rh.get(
            external_system_url=es_url, subject_id=subject_id, path=pds.path)
        allow_more_records = pds.max_records_per_subject == (
            -1) or len(records) < pds.max_records_per_subject
    except PageNotFound:
        allow_more_records = pds.max_records_per_subject != 0
    if not allow_more_records:
        log.error('Maximum number of records created for subject {0}'.format(subject_id))
        return HttpResponse('Error: The maximum number of records has been created.')

    if not pds.protocol.isUserAuthorized(request.user):
        return forbidden(request)

    def rec_id_validator(new_record_id, include_path):
        return SubjectUtils.validate_new_record_id(pds, subject, new_record_id, include_path)

    error_msgs = []
    try:
        driver = DriverUtils.getDriverFor(
            protocol_data_source=pds, user=request.user)
    # TODO ADD A BOOLEAN ALLOW_CREATE_MORE_RECORDS =
    # pds.max_recrods_allowed < 0 or pds.max_records_allowed < len(records)
        # if false show error message
        if driver.new_record_form_required():
            form_submission_url = '%s/dataentry/protocoldatasource/%s/subject/%s/create/' % (
                ServiceClient.self_root_path,
                pds.id,
                subject_id)
            if request.method == 'POST':
                # have the driver process the record create form
                try:
                    grp = SubjectUtils.get_protocol_subject_record_group(
                        pds.protocol, subject)
                    grp.client_key = pds.protocol._settings_prop(
                        'CLIENT_KEY', 'key', '')
                    rec_id_prefix = ''
                    data = extract_data_from_post_request(request)
                    label_id = data.get('label_id', 1)
                    label = er_label_rh.get(id=label_id)
                    if grp:
                        rec_id_prefix = grp.ehb_key
                    else:
                        log.error('Subject record group not found for {0}'.format(subject_id))
                        raise Exception('No subject record group found')
                    try:
                        rec_id = driver.process_new_record_form(
                            request=request,
                            record_id_prefix=rec_id_prefix,
                            record_id_validator=rec_id_validator
                        )
                        try:
                            notify_record_creation_listeners(
                                driver, rec_id, pds, request.user, subject_id)
                            # this will create the ehb external_record entry
                            # and add that record to the subject's record group
                            ehb_rec_id = SubjectUtils.create_new_ehb_external_record(
                                pds, request.user, subject, rec_id, label_id).id

                            path = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/start/' % (
                                ServiceClient.self_root_path,
                                pds.id,
                                subject_id,
                                ehb_rec_id)
                            return HttpResponseRedirect(path)
                        except RecordCreationError as rce:  # exception from the eHB
                            log.error(rce.errmsg)
                            error_msgs.append((
                                'The record could not be created on the '
                                'electronic Honest Broker. Please contact a '
                                'system administrator. There could be a '
                                'connection problem.'))
                    except IgnoreEhbExceptions as iee:
                        # TODO this is a hack until BRP can create Nautilus records
                        rec_id = iee.record_id
                        ehb_rec_id = ''
                        path = None
                        label_id = request.REQUEST.get('label_id', 1)
                        label = er_label_rh.get(id=label_id)
                        try:
                            # this will create the ehb external_record entry
                            # and add that record to the subject's record group
                            ehb_rec = SubjectUtils.create_new_ehb_external_record(
                                pds, request.user, subject, rec_id, label_id)
                            ehb_rec_id = ehb_rec.id
                            path = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/start/' % (
                                ServiceClient.self_root_path,
                                pds.id,
                                subject_id,
                                ehb_rec_id)
                            notify_record_creation_listeners(
                                driver, rec_id, pds, request.user, subject_id)
                        except RecordCreationError as rce:  # exception from the eHB
                            log.error(rce.errmsg)
                            record_already_exists = 6
                            cause = rce.raw_cause
                            if cause and len(cause) == 1 and record_already_exists == cause[0]:
                                er_rh = ServiceClient.get_rh_for(
                                    record_type=ServiceClient.EXTERNAL_RECORD)
                                ehb_recs = er_rh.get(
                                    external_system_url=pds.data_source.url, subject_id=subject_id, path=pds.path)
                                ehb_rec_id = None
                                for record in ehb_recs:
                                    if record.record_id == rec_id:
                                        ehb_rec_id = record.id
                                if ehb_rec_id:
                                    path = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/start' % (
                                        ServiceClient.self_root_path,
                                        pds.id,
                                        subject_id,
                                        ehb_rec_id)
                                else:
                                    path = None
                                    error_msgs.append(
                                        'This Subject ID has already been assigned to another subject.')
                                    form = driver.create_new_record_form(
                                        request)
                                    o_rh = ServiceClient.get_rh_for(
                                        record_type=ServiceClient.ORGANIZATION)
                                    org = o_rh.get(id=subject.organization_id)
                                    label = er_label_rh.get(id=label_id)
                                    context = {
                                        'recordCreateForm': form,
                                        'protocol': pds.protocol,
                                        'organization': org,
                                        'subject': subject,
                                        'root_path': ServiceClient.self_root_path,
                                        'pds': pds,
                                        'form_submission_url': form_submission_url,
                                        'errors': error_msgs,
                                        'label': label,
                                        'redcap_status': getRedcapStatus()
                                    }
                                    return render_to_response(
                                        'pds_dataentry_rec_create.html',
                                        context,
                                        context_instance=RequestContext(request)
                                    )
                            else:
                                log.error('Record could not be created')
                                path = None
                                error_msgs.append((
                                    'The record could not be created on the '
                                    'electronic Honest Broker. Please contact '
                                    'a system administrator. There could be a'
                                    ' connection problem.'))
                        if path:
                            return HttpResponseRedirect(path)
                    # END OF HACK CODE
                except RecordCreationError as rce:  # exceptions from the driver (i.e. errors in the form)
                    log.error(rce.errmsg)
                    error_msgs.append(rce.cause)
                    form = driver.create_new_record_form(request)
                    o_rh = ServiceClient.get_rh_for(
                        record_type=ServiceClient.ORGANIZATION)
                    org = o_rh.get(id=subject.organization_id)
                    label = er_label_rh.get(id=label_id)
                    context = {
                        'recordCreateForm': form,
                        'protocol': pds.protocol,
                        'organization': org,
                        'subject': subject,
                        'root_path': ServiceClient.self_root_path,
                        'pds': pds,
                        'form_submission_url': form_submission_url,
                        'errors': error_msgs,
                        'label': label,
                        'redcap_status': getRedcapStatus()
                    }
                    return render_to_response(
                        'pds_dataentry_rec_create.html',
                        context,
                        context_instance=RequestContext(request)
                    )
            else:  # request method not post
                # have the driver generate the form and render it
                form = driver.create_new_record_form(request)
                o_rh = ServiceClient.get_rh_for(
                    record_type=ServiceClient.ORGANIZATION)
                org = o_rh.get(id=subject.organization_id)
                label_id = request.REQUEST.get('label_id', 1)
                label = er_label_rh.get(id=label_id)
                context = {
                    'recordCreateForm': form,
                    'protocol': pds.protocol,
                    'organization': org,
                    'subject': subject,
                    'root_path': ServiceClient.self_root_path,
                    'pds': pds,
                    'form_submission_url': form_submission_url,
                    'label': label,
                    'redcap_status': getRedcapStatus()
                }
                return render_to_response(
                    'pds_dataentry_rec_create.html',
                    context,
                    context_instance=RequestContext(request)
                )
        else:
            # Show a confirmation form and on POST just ask driver to create
            # the new record, and redirect to start page
            try:
                label_id = request.REQUEST.get('label_id', 1)
                label = er_label_rh.get(id=label_id)
                ehb_rec_id = _create_external_system_record(
                    request, driver, pds, subject, label=label_id)
                path = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/start/' % (
                    ServiceClient.self_root_path,
                    pds.id,
                    subject_id,
                    ehb_rec_id)
                return HttpResponseRedirect(path)
            except RecordCreationError as rce:  # exception from the eHB
                log.error(rce.errmsg)
                error_msgs.append((
                    'The record could not be created. Please contact a system'
                    ' administrator. There could be a connection problem.'))
    except ProtocolUserCredentials.DoesNotExist:
        error_msgs.append('Your user credentials were not found for ' +
                          pds.data_source.name + '. Please contact system administrator.')

    # some error must have occurred if this code is reached
    return HttpResponse(' '.join(error_msgs))


def notify_record_creation_listeners(notifier, notifier_rec_id, notifier_pds, user, subject_id):
    '''
    Inputs:
    notifier : the driver that created the new record
    notifier_rec_id : the record in in the external system (not the eHB id)
    notifier_pds : the protocol data source where the new record was created
    subject_id : the eHB subject record id (not the organization subject id)
    '''
    # get the data link plugin selections
    for link in ProtocolDataSourceLink.objects.all():
        mod_name = link.linker_module()
        mod = __import__(mod_name)
        the_split = mod_name.split('.')
        subname = '.'
        for i in range(len(the_split) - 1):
            subname += the_split[i + 1] + '.'

        listener = None
        cmd = 'listener = mod' + subname + link.linker_class() + '()'
        exec(cmd)

        do_notify = 0 in listener.notify_on()
        if do_notify:
            listener_pds = None
            if notifier_pds == link.pds_one:
                listener_pds = link.pds_two
            else:
                listener_pds = link.pds_one

            listener_driver = DriverUtils.getDriverFor(
                protocol_data_source=listener_pds, user=user)
            listener.set_listener(listener_driver)

            es_url = listener_pds.data_source.url
            # Get the ehb-service external-records, it has the record-id for
            # the pds
            er_rh = ServiceClient.get_rh_for(
                record_type=ServiceClient.EXTERNAL_RECORD)
            try:
                records = er_rh.get(
                    external_system_url=es_url, subject_id=subject_id,
                    path=listener_pds.path)
                if len(records) == 1:
                    listener.set_listener_rec_id(records[0].record_id)
            except PageNotFound:
                listener.set_listener_rec_id(None)
            listener.notify(notifier, notifier_rec_id)


@csrf_exempt
@login_required
@connectionRefused
def pds_dataentry_form(request, pds_id, subject_id, form_spec, record_id):
    '''renders a page with a data form as generated by the driver for protocol_data_source with pk=pds_id for
    Subject with subject_id=subject_id. The specific data form is determined by the driver using the form_spec arg.
    '''

    def generateSubRecordForm(driver, external_record, form_spec, attempt_count, max_attempts):
        try:
            key = 'subrecordform_{0}_{1}'.format(external_record.id, form_spec)
            # Caching turned off for the time being on SRF
            # cf = cache.get(key)
            cf = None
            if cf:
                return cf
            else:
                form = driver.subRecordForm(external_record=external_record,
                                            form_spec=form_spec,
                                            session=request.session)
            return form
        except RecordDoesNotExist:
            return None

    pds = getProtocolDataSource(pds_id)
    if not pds.protocol.isUserAuthorized(request.user):
        return forbidden(request)

    MANAGE_EXTERNAL_IDS = False

    # Check to see if this PDS is managing external identifiers
    for _pds in pds.protocol.getProtocolDataSources():
        if _pds.driver == 3:
            ExIdSource = _pds
            MANAGE_EXTERNAL_IDS = True

    subject = getPDSSubject(pds=pds, sub_id=subject_id)

    # If we are managing external identifiers add them to the subject
    if MANAGE_EXTERNAL_IDS:
        subject.external_ids = getExternalIdentifiers(ExIdSource, subject)

    er_rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_RECORD)
    # this will be the ehb-service externalRecord for this pds, subject NOT the actual datasource record
    record = None
    error_msgs = []

    try:
        r = cache.get('externalrecord_{0}'.format(record_id))
        if r:
            record = ExternalRecord(1).identity_from_jsonObject(json.loads(r))
        else:
            record = er_rh.get(id=record_id)
    except PageNotFound:
        raise Http404

    try:
        driver = DriverUtils.getDriverFor(
            protocol_data_source=pds, user=request.user)
        # Need the external record for this pds, protcol, and subject
        # Get all external_record objects on the ehb-service for this system,
        # path, subject combination.
        if request.method == 'POST':
            # have the driver process this request
            key = 'subrecordform_{0}_{1}'.format(record.id, form_spec)
            # cache.delete(key)
            errors = driver.processForm(
                request=request, external_record=record, form_spec=form_spec, session=request.session)
            if errors:
                error_msgs = [e for e in errors]
            else:
                path = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/start/' % (
                    ServiceClient.self_root_path,
                    pds.id,
                    subject_id,
                    record_id)
                return HttpResponseRedirect(path)
        else:
            # Generate a new form
            form = generateSubRecordForm(driver, record, form_spec, 0, 1)
            if form:
                o_rh = ServiceClient.get_rh_for(
                    record_type=ServiceClient.ORGANIZATION)
                org = o_rh.get(id=subject.organization_id)
                form_submission_url = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/form_spec/%s/' % (
                    ServiceClient.self_root_path,
                    pds.id,
                    subject_id,
                    record_id,
                    form_spec)
                # Find next form to support guided entry
                try:
                    forms = json.loads(pds.driver_configuration)['form_order']
                    current_index = forms.index(form_spec)
                    next_form = forms[current_index + 1]
                    next_form_url = '%s/dataentry/protocoldatasource/%s/subject/%s/record/%s/form_spec/%s/' % (
                        ServiceClient.self_root_path,
                        pds.id,
                        subject_id,
                        record_id,
                        next_form
                    )
                except:
                    next_form_url = ''
                context = {
                    'subRecordForm': form,
                    'protocol': pds.protocol,
                    'organization': org,
                    'subject': subject,
                    'root_path': ServiceClient.self_root_path,
                    'pds': pds,
                    'form_submission_url': form_submission_url,
                    'next_form_url': next_form_url,
                    'rec_id': str(record_id),
                    'redcap_status': getRedcapStatus()
                }

                return render_to_response('pds_dataentry_srf.html', context,
                                          context_instance=RequestContext(request))
            else:
                error_msgs.append(
                    'No record exists in the data source with the record id supplied by the eHB.')
                log.error('Error {0}'.format(' '.join(error_msgs)))
    except PageNotFound:
        error_msgs.append(
            'No record could be found in the eHB for this request')
        log.error('Error {0}'.format(' '.join(error_msgs)))
    except ProtocolUserCredentials.DoesNotExist:
        error_msgs.append(
            'Your user credentials were not found for %s. Please contact system administrator.' % pds.data_source.name
        )

    # Some error must have occured:
    log.error('Error {0}'.format(' '.join(error_msgs)))
    return HttpResponse(' '.join(error_msgs))


def extract_data_from_post_request(request):
        # This will hold the data submitted in the form
        data = {}
        post_data = request._post
        if post_data:
            for k, v in post_data.items():
                data[k] = v
            return data
