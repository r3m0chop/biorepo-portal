from django.conf.urls import patterns, url, include
from django.conf.urls.static import static
from django.contrib import admin
from django.template.loader import add_to_builtins
from django.conf import settings
from django.views.generic import RedirectView
import re

admin.autodiscover()
add_to_builtins('portal.formutils')

urlpatterns = patterns(
    '',
    # simple redirect to canonical login URL
    # url(r'^$', RedirectView.as_view(url=settings.LOGIN_URL, permanent=True)),

    # admin urls
    url(r'^admin/', include(admin.site.urls)),

    # registration, account management urls
    url(r'^accounts/', include('accounts.urls')),
    url(r'^eula/$', 'accounts.views.eula', name='eula'),
    url(r'^login/$', 'accounts.views.throttled_login', name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login', name='logout'),

    # project specific urls
    url(r'', include('portal.urls')),
    url(r'^api/', include('api.urls')),

    url(r'session_security/', include('session_security.urls')),
    url(r'^sessions/create/', 'rest_framework_jwt.views.obtain_jwt_token'),
)
urlpatterns += patterns(
    'django.views.static',
    url(r'^{0}(?P<path>.*)$'.format(settings.MEDIA_URL.lstrip('/')), 'serve', {
        'document_root': settings.MEDIA_ROOT
        }),
    url(r'^{0}(?P<path>.*)$'.format(settings.STATIC_URL.lstrip('/')), 'serve', {
        'document_root': settings.STATIC_ROOT
    }),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
