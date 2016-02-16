from django.conf.urls import url, patterns, include

dataentry_patterns = patterns(
    'portal.views',
    url(r'^protocol/(?P<protocol_id>\d+)/$', 'subject_select'),
    url(r'^protocol/(?P<protocol_id>\d+)/newsubject/$', 'new_subject'),
    url(r'^protocol/(?P<protocol_id>\d+)/editsubject/(?P<subject_ehb_id>\w+)/$', 'edit_subject'),
    url(r'^protocoldatasource/(?P<pds_id>\d+)/subject/(?P<subject_id>\d+)/list/$', 'pds_dataentry_list'),
    url(
    r'^protocoldatasource/(?P<pds_id>\d+)/subject/(?P<subject_id>\d+)/create/$',
    'pds_dataentry_create'),
    url(
    r'^protocoldatasource/(?P<pds_id>\d+)/subject/(?P<subject_id>\d+)/record/(?P<record_id>\d+)/start/$',
    'pds_dataentry_start'),
    url(
    r'^protocoldatasource/(?P<pds_id>\d+)/subject/(?P<subject_id>\d+)/record/(?P<record_id>\d+)/form_spec/(?P<form_spec>[a-z0-9-_]+)/$',  # noqa
    'pds_dataentry_form'),
)

urlpatterns = patterns(
    '',
    url(r'^$', 'portal.views.welcome', name='welcome'),
    url(r'^dataentry/', include(dataentry_patterns, namespace='dataentry'))
)
