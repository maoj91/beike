from django.conf.urls import patterns, url
from data.models import Post
from buy import views

urlpatterns = patterns('',
	url(r'^all_list/$',views.all_list),
	url(r'^form/$',views.form),
	url(r'^form_submit/$',views.form_submit),
)
