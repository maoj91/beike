from django.conf.urls import patterns, url

from weixin import views

urlpatterns = patterns('',
    url(r'^$', views.valid, name='weixin_valid')
)
