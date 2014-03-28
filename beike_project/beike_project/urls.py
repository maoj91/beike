from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib import admin
from beike_project import views
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^admin/', include(admin.site.urls)),
	url(r'^weixin$',include('weixin.urls')),
	url(r'^s3/',include('s3.urls')),
	#url(r'^(?P<userid>[-\w]+)/$', TemplateView.as_view(template_name='index.html'), name="home"),
	url(r'^$', views.index),
	url(r'^sell/', include('sell.urls')),
	url(r'^buy/', include('buy.urls')),
	url(r'^history/', include('history.urls')),
	url(r'^detail/', include('detail.urls')),
	url(r'^me/', include('me.urls')),
)
