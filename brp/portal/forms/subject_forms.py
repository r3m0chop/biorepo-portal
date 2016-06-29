from django import forms
from django.core.exceptions import ValidationError
from django.utils.safestring import mark_safe
from portal.models import protocols
from portal.ehb_service_client import ServiceClient
from portal.utilities import SubjectUtils
from ehb_client.requests.subject_request_handler import Subject
from ehb_client.requests.exceptions import PageNotFound
from copy import deepcopy
import logging

logger = logging.getLogger(__name__)


class DynamicChoiceField(forms.ChoiceField):

    def validate_organization(self, value):
        if value == u'0':
            raise ValidationError(u'A selection is required')

    default_validators = []

    def validate(self, value):
        self.validate_organization(value)


class DatePickerInput(forms.DateInput):

    def render(self, name, value, attrs=None):
        attrs.update({'class':'field_input_date'})
        html = super(DatePickerInput, self).render(name, value, attrs)
        html += """<input class="btn_today" id="todaybutton" type="button" value="Today" />"""
        html += """<br/><span style="color:red" class="datespan" id="datespan_dob"></span>"""
        return mark_safe(html)


class GenericSubjectForm(forms.Form):
    organization = DynamicChoiceField(label="Group", choices=((u'0', '------------'),))
    subject_id = forms.CharField(max_length=40, label='MRN')
    subject_id_verify = forms.CharField(max_length=40, label='Verify MRN')
    first_name = forms.CharField(max_length=50, label='First Name')
    last_name = forms.CharField(max_length=50, label='Last Name')
    dob = forms.DateField(widget=DatePickerInput, input_formats=['%Y-%m-%d', ], label='Date Of Birth (yyyy-mm-dd)')


    def selectedOrg(self):
        return self.data.__getitem__('organization')

    def getOrgFromSelection(self, selection):
        # This is the organization object in the local portal app db
            _org = protocols.Organization.objects.get(pk=selection)
            _org_name = _org.name
            # the ehb-service organization object this is guaranteed to have the correct id
            orh = ServiceClient.get_rh_for(record_type=ServiceClient.ORGANIZATION)
            return orh.get(name=_org_name)

    def clean(self):

        # Clean whitespace
        cleaned_data = self.cleaned_data
        for k in self.cleaned_data:
            try:
                cleaned_data[k] = self.cleaned_data[k].strip()
            except AttributeError:  # Ignore trying to strip non-stringlike types
                pass

        # Verify subject ID match
        subject_id = cleaned_data.get('subject_id')
        subject_id_verify = cleaned_data.get('subject_id_verify')
        if subject_id != subject_id_verify:
            raise ValidationError('The subject id entries do not match')

        return cleaned_data


class EditSubjectForm(GenericSubjectForm):

    def save(self, subject, protocol):
        if self.is_valid():
            cleaned_data = self.cleaned_data
            # Legacy Information
            old_subject = deepcopy(subject)
            old_subject.organization_id
            old_subject.group_name = SubjectUtils.protocol_subject_record_group_name(protocol, old_subject)
            # Updated Information
            subject.old_subject = old_subject
            subject.first_name = cleaned_data.get('first_name')
            subject.last_name = cleaned_data.get('last_name')
            subject.dob = cleaned_data.get('dob')
            subject.organization_subject_id = cleaned_data.get('subject_id')
            org = self.getOrgFromSelection(cleaned_data.get('organization'))
            subject.organization_id = org.id
            srh = ServiceClient.get_rh_for(record_type=ServiceClient.SUBJECT)
            subject.group_name = SubjectUtils.protocol_subject_record_group_name(protocol, subject)
            r = srh.update(subject)[0]
            if SubjectUtils.create_protocol_subject_record_group(protocol, subject):
                SubjectUtils.delete_protocol_subject_record_group(protocol, old_subject)

            success = r.get('success')
            errors = r.get('errors')
            return [success, subject, errors]
        else:
            return None


class NewSubjectForm(GenericSubjectForm):

    def save(self, protocol):
        '''
        Attempts to save the data provided in the form as a new subject in
        ehb-service database.

        Output
        ------

        If the form is valid:
            {
                subject: Subject_instance,
                "success": boolean,
                "errors": errors
            }
            (Where errors is only present if there were errors in creating the
            object in the server db)

        else:
            None
        '''
        if self.is_valid():
            cleandata = self.cleaned_data
            sub_id = cleandata.get('subject_id')
            fn = cleandata.get('first_name')
            ln = cleandata.get('last_name')
            dob = cleandata.get('dob')
            org = self.getOrgFromSelection(cleandata.get('organization'))

            # Create the subject record for this organization
            # First check if the subject is in the system at all, if not create it
            srh = ServiceClient.get_rh_for(record_type=ServiceClient.SUBJECT)

            errors = []
            try:
                subject = srh.get(organization_id=org.id, organization_subject_id=sub_id)
                # If found this indicates the subject is already in the ehb for
                # this organization, but not necessarily for this protocol.
                # That will be checked below in the external record search

                # check if all new_subject form fields match this existing
                # subject if not, the form data must be corrected
                # should add an option to update the record (permission to do so might be role based)
                success = True
                prefix = "A subject with this " + org.subject_id_label + " exists but with "
                if subject.first_name != fn:
                    success = False
                    errors.append(prefix + "first name: " + subject.first_name)
                if subject.last_name != ln:
                    success = False
                    errors.append(prefix + "last name: " + subject.last_name)
                if subject.dob != dob:
                    success = False
                    errors.append(prefix + "birth date: " + str(subject.dob))
            except PageNotFound:
                # Subject not in system so create it
                s = Subject(first_name=fn,
                            last_name=ln,
                            dob=dob,
                            organization_id=org.id,
                            organization_subject_id=sub_id)
                r = srh.create(s)[0]
                success = r.get('success')
                errors = r.get('errors')
                subject = r.get(Subject.identityLabel)

            # Don't proceed any further if there are already errors
            if not success:
                logger.error('There was an error creating the subject.')
                return [success, subject, errors]

            if not errors:
                errors = []
            # First check if the subject is already in the group
            if protocol.getSubjects() and subject in protocol.getSubjects():
                # Subject is already on this protocol
                errors.append(
                    'This subject ' + org.subject_id_label +
                    ' has already been added to this project.'
                )
                logger.error("Could not add subject. They already exist on this protocol.")
                success = False
            else:
                # Add this subject to the protocol and create external record group
                # Create subject/protocol external record group
                if SubjectUtils.create_protocol_subject_record_group(protocol, subject):
                    # Add subject to protocol subject group
                    if protocol.addSubject(subject):
                        success = True
                    else:
                        logger.error("Could not add subject. Failure to create Protocol Subject Record Group.")
                        errors.append(
                            'Failed to complete eHB transactions. Could not add subject to project. Please try again.')
                        success = False
                else:
                    # For some reason we couldn't get the eHB to add the subject to the protocol group
                    logger.error("Could not add subject to project. Could not add subject to the protocol group.")
                    errors.append(
                        'Failed to complete eHB transactions. Could not add subject to project. Please try again.')
                    success = False

            return [success, subject, errors]
        else:
            return None
