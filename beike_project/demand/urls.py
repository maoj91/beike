from django.conf.urls import patterns, url

from demand import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index')
)
