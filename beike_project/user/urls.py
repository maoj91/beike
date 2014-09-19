from django.conf.urls import patterns, url
from data.models import User
from user import views

urlpatterns = patterns('',
	url(r'^(\d+)/$', views.index),
	url(r'^(\d+)/edit/$', views.edit),
	url(r'^(\d+)/edit_address/$', views.edit_address),
	url(r'^(\d+)/save_address/$', views.save_address),
	url(r'^(\d+)/update/$', views.update),
	url(r'^save_privacy/$', views.save_privacy),
	url(r'^get_info/$', views.get_info),
	url(r'^get_info/get_city_by_latlong$', views.get_and_create_location_by_latlong),
	url(r'^get_info/get_city_by_zipcode$', views.get_and_create_location_by_zipcode),
	url(r'^get_info/get_zipcode_by_latlong$', views.get_location_by_latlong),
	url(r'^get_info/get_latlong_by_zipcode$', views.get_location_by_zipcode),
	url(r'^get_info/check_email$', views.check_email),
	url(r'^user_guide/$', views.user_guide),
	url(r'^create/$', views.create),
)
