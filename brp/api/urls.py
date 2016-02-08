from django.conf.urls import url, include
from rest_framework import routers
from api import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'organizations', views.OrganizationViewSet)
router.register(r'protocols', views.ProtocolViewSet)
router.register(r'datasources', views.DataSourceViewSet)
router.register(r'protocoldatasources', views.ProtocolDataSourceViewSet)

protocol_subjects = views.ProtocolViewSet.as_view({
    'get': 'subjects'
})
protocol_subject = views.ProtocolViewSet.as_view({
    'post': 'add_subject',
    'put': 'update_subject'
})
protocol_data_sources = views.ProtocolViewSet.as_view({
    'get': 'data_sources'
})
protocol_organizations = views.ProtocolViewSet.as_view({
    'get': 'organizations'
})
pds_subjects = views.ProtocolDataSourceViewSet.as_view({
    'get': 'subjects'
})
subject_records = views.ProtocolDataSourceViewSet.as_view({
    'get': 'subject_records'
})

# Wire up our API using automatic URL routing.
# Additionally, we include the login URLs for the browsable API
urlpatterns = [
    url(r'^protocols/(?P<pk>[0-9]+)/subjects/$',
        protocol_subjects, name='protocol-subject-list'),
    url(r'^protocols/(?P<pk>[0-9]+)/subjects/create$',
        protocol_subject, name='protocol-subject-create'),
    url(r'^protocols/(?P<pk>[0-9]+)/subjects/(?P<subject>[0-9]+)$',
        protocol_subject, name='protocol-subject-view'),
    url(r'^protocols/(?P<pk>[0-9]+)/data_sources/$',
        protocol_data_sources,
        name='protocol-datasources-list'),
    url(r'^protocols/(?P<pk>[0-9]+)/organizations/$',
        protocol_organizations,
        name='protocol-organization-list'),
    url(
        r'^protocoldatasources/(?P<pk>[0-9]+)/subjects/(?P<subject>[0-9]+)/records/$',
        subject_records,
        name='pds-subject-record-list'),
    url(
        r'^protocoldatasources/(?P<pk>[0-9]+)/subjects/$',
        pds_subjects,
        name='pds-subject-list'),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
