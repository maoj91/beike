from django.conf.urls import patterns, url
from buy import views

urlpatterns = patterns('',
	url(r'^all_list/$',views.all_list),
	url(r'^form/$',views.form),
	url(r'^form_submit/$',views.form_submit),
	url(r'^get_posts_by_page/$',views.get_posts_by_page),
	url(r'^follow_post/$',views.follow_post),
	url(r'^open_close_post/$',views.open_close_post),
)
