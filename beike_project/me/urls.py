from django.conf.urls import patterns, url
from data.models import User
from me import views
from django.views.generic import TemplateView

urlpatterns = patterns('',
	url(r'^$', views.index),
	url(r'^save_profile/$', views.save_profile),
	url(r'^save_notification/$', views.save_notification),
	url(r'^save_privacy/$', views.save_privacy),
	url(r'^get_area/$', views.get_area),
	url(r'^get_email/(?P<city_id>\d+)$', views.get_email),
	url(r'^create/$', views.create),
)
