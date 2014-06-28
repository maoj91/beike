from django.conf.urls import patterns, url
from data.models import User
from user import views

urlpatterns = patterns('',
	url(r'^(\d+)/$', views.index),
	url(r'^save_profile/$', views.save_profile),
	url(r'^save_privacy/$', views.save_privacy),
	url(r'^update_profile_image/$', views.update_profile_image),
	url(r'^get_info/$', views.get_info),
	url(r'^get_info/get_city_by_latlong$', views.get_city_by_latlong),
	url(r'^get_info/get_city$', views.get_city_by_zipcode),
	url(r'^get_info/get_zipcode_by_latlong$', views.get_zipcode_by_latlong),
	url(r'^get_info/get_latlong_by_zipcode$', views.get_latlon_by_zipcode),
	url(r'^get_info/check_email$', views.check_email),
	url(r'^create/$', views.create),
)