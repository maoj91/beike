from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib import admin
from beike_project import views
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^admin/', include(admin.site.urls)),
	url(r'^weixin$',include('weixin.urls')),
	url(r'^s3/',include('s3.urls')),
	url(r'^$', views.index),
	url(r'^sell/', include('sell.urls')),
	url(r'^buy/', include('buy.urls')),
	url(r'^detail/', include('detail.urls')),
	url(r'^user/', include('user.urls')),
	url(r'^about/', include('about.urls')),
	url(r'^mine/', include('mine.urls')),
)
