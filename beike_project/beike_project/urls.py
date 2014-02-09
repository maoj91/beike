from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', TemplateView.as_view(template_name='index.html'), name="home"),
	url(r'^admin/', include(admin.site.urls)),
	url(r'^weixin$',include('weixin.urls')),
	url(r'^s3/',include('s3.urls')),
	url(r'^(?P<userid>[-\w]+)/$', TemplateView.as_view(template_name='index.html'), name="home"),
	url(r'^(?P<user_id>[-\w]+)/sell/', include('sell.urls')),
	url(r'^(?P<user_id>[-\w]+)/buy/', include('buy.urls')),
	url(r'^(?P<user_id>[-\w]+)/history/', include('history.urls')),
	url(r'^(?P<user_id>[-\w]+)/detail/', include('detail.urls')),
	url(r'^(?P<user_id>[-\w]+)/me/', include('me.urls')),
)
