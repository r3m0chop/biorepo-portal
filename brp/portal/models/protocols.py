import random
import string
import json

from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from portal.models.base import CreatedModified
from portal.ehb_service_client import ServiceClient
from portal.models.constants import ProtocolUserConstants, ProtocolDataSourceConstants

from ehb_client.requests.exceptions import PageNotFound, RequestedRangeNotSatisfiable
from ehb_client.requests.external_system_request_handler import ExternalSystem
from ehb_client.requests.group_request_handler import Group

import ehb_datasources.drivers.phenotype.driver as PhenotypeDriver
import ehb_datasources.drivers.redcap.driver as RedCapDriver
import ehb_datasources.drivers.nautilus.driver as NauDriver
import ehb_datasources.drivers.external_identifiers.driver as ExIdDriver

__all__ = ('DataSource',)


class Base(CreatedModified):
    def _settings_prop(self, GROUP, KEY, default=None):
        PROTOCOL_PROPS = settings.PROTOCOL_PROPS
        if PROTOCOL_PROPS:
            GROUP_SETTINGS = PROTOCOL_PROPS.get(GROUP)
            if GROUP_SETTINGS:
                return GROUP_SETTINGS.get(KEY, default)
            else:
                return default
        else:
            return default

    def save(self, *args, **kwargs):
        # Create an immutable key for this protocol
        super(Base, self).save(*args, **kwargs)

    class Meta:
        app_label = u'portal'
        abstract = True


class ImmutableKey(Base):

    key = models.CharField(max_length=255, unique=True,
                           verbose_name='Immutable Key', editable=False,
                           blank=True)

    def _make_random_key(self, seed, ja, l,
                         chars=string.ascii_uppercase + string.digits):
        random.seed(seed)
        random.jumpahead(ja * 50)
        return ''.join(random.choice(chars) for idx in range(l))

    def _set_key(self):
        # Generate a new key, override any key that was used to create this object
        if not self.pk:
            key_length = self._key_length()
            seed = self._key_seed()
            jump = ImmutableKey.objects.count()
            #
            uk = ''
            idx = 0
            max_idx = 1e6
            while idx < max_idx:
                uk = self._make_random_key(seed=seed, ja=jump + idx,
                                           l=key_length)
                immutables_using_uk = ImmutableKey.objects.filter(key=uk)
                if immutables_using_uk.count() == 0:
                    idx = max_idx
                else:
                    idx += 1
            self.key = uk

    def _key_seed(self, default=123456789):
        return self._settings_prop('IMMUTABLE_KEYS', 'seed', default)

    def _key_length(self, default=15):
        return self._settings_prop('IMMUTABLE_KEYS', 'length', default)

    def save(self, *args, **kwargs):
        self._set_key()
        super(ImmutableKey, self).save()


class BaseWithImmutableKey(Base):
    '''
    The immutable_key will serve as a unique identifier for the Organization
    which never changes
    '''
    immutable_key = models.ForeignKey(ImmutableKey, editable=False, blank=True,
                                      unique=True, null=True)

    def _create_immutable_key(self):
        '''
        Generate an immutable_key for this entity
        '''

        if self.immutable_key:
            # If the key already exists then this model is being edited but
            # this key should not change
            return
        else:
            ik = ImmutableKey()
            ik.save()
            self.immutable_key = ik

    def save(self, *args, **kwargs):
        self._create_immutable_key()
        super(BaseWithImmutableKey, self).save(*args, **kwargs)

    class Meta:
        app_label = u'portal'
        abstract = True


class Organization(BaseWithImmutableKey):
    # The name of the organization, e.g. CHOP
    name = models.CharField(max_length=255, unique=True)
    # The name of the unique subject identifier used by the organization, e.g. MRN
    subject_id_label = models.CharField(
        max_length=50,
        verbose_name='Unique Subject Record ID Label',
        default='Record ID'
    )

    class Meta(BaseWithImmutableKey.Meta):
        ordering = ['name']

    def save(self, *args, **kwargs):
        '''
        On save we need to make sure this organization exists in the
        ehb-service, otherwise create it
        '''
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.ORGANIZATION)
        try:
            org = rh.get(name=self.name)
            super(Organization, self).save(*args, **kwargs)
        except PageNotFound:
            org = Organization(name=self.name, subject_id_label=self.subject_id_label)
            r = rh.create(org)[0]
            if(r.get('success')):
                    super(Organization, self).save(*args, **kwargs)
            else:
                raise Exception('Unable to create Organization record in ehb-service')

    def getEhbServiceInstance(self):
        '''
        Gets the record for this organization as maintained in the ehb service
        PageNotFound Exception will be thrown if no record is found
        '''
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.ORGANIZATION)
        return rh.get(name=self.name)

    def __unicode__(self):
        return self.name


class DataSource(Base):
    '''
    This class represents an external data source used for a given protocol.
    It is the link between the brp app and the ehb-service. The field
    ehb_service_es_id is the id of the ExternalSystem record stored in the
    ehb-service corresponding to this DataSource. The name field should match
    the name field in the ExternalSystem record
    '''

    name = models.CharField(max_length=200, unique=True, verbose_name='Data Source Name')
    url = models.URLField(max_length=255, unique=True, verbose_name='Data Source URL')
    desc_help = 'Please briefly describe this data source.'
    description = models.TextField(verbose_name='Data Source Description', help_text=desc_help)
    ehb_service_es_id = models.IntegerField(
        editable=False, default=-1, verbose_name='EHB Service External System ID')

    def save(self, *args, **kwargs):
        '''
        On save we need to make sure this source exists in the ehb service, otherwise create it
        '''
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_SYSTEM)
        try:
            es = rh.get(url=self.url)
            self.ehb_service_es_id = es.id
            super(DataSource, self).save(*args, **kwargs)
        except PageNotFound:
            es = ExternalSystem(
                name=self.name,
                url=self.url,
                description=self.description
            )
            r = rh.create(es)[0]
            if(r.get('success')):
                    self.ehb_service_es_id = es.id
                    super(DataSource, self).save(*args, **kwargs)
            else:
                raise Exception('Unable to create ExternalSystem record in ehb-service')

    def clean(self):
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_SYSTEM)
        try:
            es = rh.get(url=self.url)
            if(self.name != es.name):
                self.name = es.name
                msg = ('Accept existing name? There is already a system in the' +
                       ' ehb-service with this URL but with the name: ' + es.name +
                       '. This DataSource can only be saved with that name.')
                raise ValidationError(msg)
        except PageNotFound:
            # The save method will create the record in the ehb-service
            pass

        try:
            es = rh.get(name=self.name)
            if(self.url != es.url):
                msg = ('Please change the name or correct the URL. There is ' +
                       'already a system in the ehb-service with this name but' +
                       ' with URL: ' + es.url)
                raise ValidationError(msg)
        except PageNotFound:
            # The save method will create the record in the ehb-service
            pass

    def __unicode__(self):
        return self.name

    def getExternalSystem(self):
        '''
        This returns the ehb-service representation of this DataSource
        '''
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_SYSTEM)
        es = rh.get(url=self.url)
        if es:
            if es.id != self.ehb_service_es_id:
                # The record id's changed on the ehb-service, so update
                self.ehb_service_es_id = es.id
                self.save()
        return es

    def getSubjects(self):
        '''
        Returns the ehb-service representation of the subjects that have
        external_records for this data_source
        '''
        es = self.getExternalSystem()
        if es:
            rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_SYSTEM)
            return rh.subjects(es.id)


class Protocol(BaseWithImmutableKey):
    '''
    This class holds the information necessary for an ehb-cccr protocol
    '''

    class Meta(BaseWithImmutableKey.Meta):
        ordering = ['name']

    name = models.CharField(max_length=200, unique=True, verbose_name='Protocol Name')
    data_sources = models.ManyToManyField(DataSource, through='ProtocolDataSource')
    users = models.ManyToManyField(User, through='ProtocolUser', blank=True)
    organizations = models.ManyToManyField(Organization, blank=True)

    def __unicode__(self):
        return self.name

    def ehb_group_name(self):
        return 'BRP:' + self.immutable_key.key

    def _client_key(self):
        return self._settings_prop('CLIENT_KEY', 'key', 'xyz123abc987')

    def save(self, *args, **kwargs):
        super(Protocol, self).save(*args, **kwargs)
        # Need to create a group for this protocol if it doesn't exist
        # (i.e. before there is a pk) that will be used to identify subjects
        # on the protocol
        gh = ServiceClient.get_rh_for(record_type=ServiceClient.GROUP)
        try:
            gh.get(name=self.ehb_group_name())
        except RequestedRangeNotSatisfiable:
            grp = Group(
                name=self.ehb_group_name(),
                description='A BRP Protocol Group',
                is_locking=True,
                client_key=self._client_key()
            )
            r = gh.create(grp)[0]
            if not (r.get("success")):
                raise Exception(
                    'Unable to create Protocol Subject Group in ehb-service')

    def _gh(self):
        return ServiceClient.get_rh_for(record_type=ServiceClient.GROUP)

    def _subject_group(self):
        try:
            grp = self._gh().get(name=self.ehb_group_name())
            grp.client_key = self._client_key()
            return grp
        except Exception:
            return None

    def addSubject(self, subject):
        try:
            r = self._gh().add_subjects(self._subject_group(), [subject])
            return r[0].get('success')
        except Exception:
            return False

    def getSubjects(self):
        '''
        Returns the Subjects on this protocol
        '''
        try:
            return self._gh().get_subjects(self._subject_group())
        except Exception:
            return None

    def isSubjectOnProtocol(self, subject):
        return subject in self.getSubjects()

    def getProtocolDataSources(self):
        return ProtocolDataSource.objects.filter(protocol=self)

    def isUserAuthorized(self, user):
        return user in self.users.all()


class ProtocolDataSource(Base):

    class Meta(Base.Meta):
        ordering = ['protocol']

    protocol = models.ForeignKey(Protocol, related_name='protocol_data_sources')
    data_source = models.ForeignKey(DataSource, verbose_name='Data Source')

    # This is the path to the records associated with the protocol on the data_source
    path = models.CharField(max_length=255, verbose_name='Path to record collection')

    DRIVER_CHOICES = (
        (ProtocolDataSourceConstants.redcap_driver, 'REDCap Client'),
        (ProtocolDataSourceConstants.nautilus_driver, 'Nautilus'),
	(ProtocolDataSourceConstants.phenotype_driver, 'Phenotype Intake'),
	(ProtocolDataSourceConstants.external_identifiers, 'External Identifiers')
    )
    driver = models.IntegerField(verbose_name='Driver Name', choices=DRIVER_CHOICES)

    driver_configuration = models.TextField(verbose_name='Driver Configuration Options', blank=True)

    display_label = models.CharField(verbose_name='Display Name', max_length=50)

    max_records_per_subject = models.IntegerField(
        verbose_name='Maximum Number of Records Allowed Per Subject',
        default=-1
    )

    def _isSecure(self):
        return self.data_source.url.startswith('https')

    def clean(self):
        rh = ServiceClient.get_rh_for(record_type=ServiceClient.EXTERNAL_SYSTEM)
        try:
            json.loads(self.driver_configuration)
        except ValueError:
            msg = ('Please enter a valid JSON object in Driver Configuration Options. ' +
                   'If there is no configuration enter "{}"')
            raise ValidationError(msg)

    def getDriver(self, protocol_user_credentials):
        driver = None
        if self.driver == ProtocolDataSourceConstants.redcap_driver:
            pw = protocol_user_credentials.data_source_password
            driver = RedCapDriver.ehbDriver(
                self.data_source.url,
                password=pw,
                secure=self._isSecure()
            )
        elif self.driver == ProtocolDataSourceConstants.nautilus_driver:
            pw = protocol_user_credentials.data_source_password
            user = protocol_user_credentials.data_source_username
            driver = NauDriver.ehbDriver(
                url=self.data_source.url,
                user=user,
                password=pw,
                secure=self._isSecure()
            )
        elif self.driver == ProtocolDataSourceConstants.phenotype_driver:
            pw = protocol_user_credentials.data_source_password
            user = protocol_user_credentials.data_source_username
            driver = PhenotypeDriver.PhenotypeDriver(
                url=self.data_source.url,
                user=user,
                password=pw,
                secure=self._isSecure()
            )
	elif self.driver == ProtocolDataSourceConstants.external_identifiers:
	    pw = protocol_user_credentials.data_source_password
	    user = protocol_user_credentials.data_source_username
	    driver = ExIdDriver.ehbDriver(
		url=self.data_source.url,
		user=user,
		password=pw,
		secure=self._isSecure()
	    )

        return driver

    def __unicode__(self):
        return self.protocol.name + ', ' + self.data_source.name + ', ' + self.path


class ProtocolDataSourceLink(models.Model):
    '''
    This model is used to link records in two protocol data sources.

    The actions required to link the data sources are performed by datasource
    plugins. The available plugins are set in the PLUGINS variable in the
    django settings
    '''
    pds_one = models.ForeignKey(
        ProtocolDataSource,
        verbose_name="Protocol Data Source",
        related_name='pds_one_set'
    )
    pds_two = models.ForeignKey(
        ProtocolDataSource,
        verbose_name='Protocol Data Source',
        related_name='pds_two_set'
    )

    PLUGIN_CHOICES = []
    available_plugins = settings.PLUGINS
    if available_plugins:
        datasource_plugs = available_plugins.get('DATASOURCE')
        if datasource_plugs:
            linker_plugs = datasource_plugs.get('DATA_SOURCE_LINKERS')
            if linker_plugs:
                for plug in linker_plugs:
                    mod = plug.get('module')
                    clz = plug.get('class')
                    disname = plug.get('display_name')
                    if not mod or not clz or not disname:
                        raise Exception("DATA_SOURCE_LINKER settings is not valid.")
                    PLUGIN_CHOICES.append((mod + ',' + clz, disname))

    linker = models.CharField(verbose_name='Linking Plugin', max_length=200, choices=PLUGIN_CHOICES)

    def linker_module(self):
        return self.linker.split(',')[0]

    def linker_class(self):
        return self.linker.split(',')[1]

    def clean(self):
        '''
        The normal unique_together constraint doesn't work because we want to
        ensure that for two protocol data sources, say A and B, and a linker,
        say L, that only one ProtocolDataSourceLink record can be created
        regardless of what position A and B are held in pds_one and pds_two
        '''
        try:
            msg = 'This protocol data source linking option has already been created.'
            order_one = ProtocolDataSourceLink.objects.filter(
                pds_one=self.pds_one).filter(pds_two=self.pds_two).filter(linker=self.linker)
            for entry in order_one:
                if entry.pk != self.pk:
                    # If they are equal we are modifying this record
                    raise ValidationError(msg)
            order_two = ProtocolDataSourceLink.objects.filter(
                pds_one=self.pds_two).filter(pds_two=self.pds_one).filter(linker=self.linker)
            for entry in order_two:
                if entry.pk != self.pk:
                    # If they are equal we are modifying this record
                    raise ValidationError(msg)
        except ProtocolDataSource.DoesNotExist:
            # The ProtocolDataSource validation will handle this
            pass

    class Meta(object):
        app_label = u'portal'


class ProtocolUser(Base):
    '''
    This class is join between a Protocol and an Portal User.

    It defines that User's role (permission level for the protocol)
    '''
    protocol = models.ForeignKey(Protocol)
    user = models.ForeignKey(User)
    roles = (
      (ProtocolUserConstants.research_coordinator, 'Research Coordinator'),
    )
    role = models.IntegerField(choices=roles)

    class Meta(Base.Meta):
        unique_together = ('protocol', 'user')
        ordering = ['user']

    def __unicode__(self):
        return self.user.username + ', ' + self.protocol.name


class ProtocolUserCredentials(Base):
    '''
    This class holds information necessary for Portal user to access a given
    DataSource for a given protocol
    '''
    protocol = models.ForeignKey(Protocol, verbose_name='Protocol')
    data_source = models.ForeignKey(ProtocolDataSource, verbose_name='Protocol Data Source')
    user = models.ForeignKey(User, verbose_name='User')
    protocol_user = models.ForeignKey(ProtocolUser, verbose_name='Protocol User')
    data_source_username = models.CharField(
        max_length=50, verbose_name='Username for Data Source', blank=True)
    data_source_password = models.CharField(
        max_length=128, verbose_name='Password for Data Source')
    allow_label_printing = models.BooleanField(
        verbose_name='Allow Label Printing', default=False)
    allow_zpl_export = models.BooleanField(verbose_name='Allow Raw ZPL Export', default=False)
    allow_chop_printing = models.BooleanField(
        verbose_name='Allow label printing to CHOP Networked Printers', default=False)

    class Meta(Base.Meta):
        unique_together = ('data_source', 'user', 'protocol')
        verbose_name = 'Protocol User Credentials'
        verbose_name_plural = 'Protocol User Credentials'
        ordering = ['protocol']

    def __unicode__(self):
        return '{0}, {1}, {2}'.format(
            self.user.__unicode__(),
            self.protocol.name,
            self.data_source.data_source.name
        )
