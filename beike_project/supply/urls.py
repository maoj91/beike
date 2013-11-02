from django.conf.urls import patterns, url

from supply import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index')
)
