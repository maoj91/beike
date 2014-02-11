from django.conf.urls import patterns, url
from data.models import User
from settings import views
from django.views.generic import TemplateView

urlpatterns = patterns('',
	url(r'^$', views.index),
	url(r'^save_profile/$', views.save_profile),
)
