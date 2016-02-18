from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
factory = APIRequestFactory()


class TestProtocolDatasourceAPI(APITestCase):

    fixtures = ['brp/api/fixtures/test_data.json']

    def test_has_content_length(self):
        '''returns should always have a content-length provided
        '''
        token = Token.objects.get(user__username='admin')
        url = reverse('pds-subject-list', args=[1])
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.get(url, format='json')
        self.assertTrue(True, response.has_header('content-length'))


class TestProtocolAPI(APITestCase):

    fixtures = ['brp/api/fixtures/test_data.json']

    def test_protocol_with_no_datasources(self):
        token = Token.objects.get(user__username='admin')
        url = reverse('protocol-datasources-list', args=[2])
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([], response.data)

    def test_protocol_with_empty_datasource_configuration(self):
        token = Token.objects.get(user__username='admin')
        url = reverse('protocol-datasources-list', args=[1])
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)
        protocol = response.data[0]
        self.assertEqual(
            protocol['data_source'],
            {
                'description': u"CHOP's REDCap Instance",
                'url': u'https://redcap.chop.edu/api/',
                'ehb_service_es_id': 1,
                'desc_help': 'Please briefly describe this data source.',
                'id': 1,
                'name': u'REDCap'
            }
        )
        self.assertEqual(
            protocol['protocol'],
            'http://testserver/api/protocols/1/'
        )
        self.assertEqual(
            protocol['max_records_per_subject'],
            -1
        )
        self.assertEqual(
            protocol['driver'],
            0,
        )
        self.assertEqual(
            protocol['driver_configuration'],
            {'labels': [(1, 'Record')]}
        )
        self.assertEqual(
            protocol['display_label'],
            u'Health Data',
        )
        self.assertEqual(
            protocol['authorized'],
            True
        )
        self.assertEqual(
            protocol['path'],
            u'Demo'
        )
        self.assertEqual(
            protocol['id'],
            1
        )
