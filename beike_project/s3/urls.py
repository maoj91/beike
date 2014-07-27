from django.conf.urls import patterns, include, url
from s3 import views

urlpatterns = patterns('',
	url(r'^sign/$',views.sign),
	url(r'^upload/$', views.upload),
)


