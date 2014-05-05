from django.conf.urls import patterns, url
from mine import views

urlpatterns = patterns('',
	url(r'^$',views.index),
)
