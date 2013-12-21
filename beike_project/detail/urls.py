from django.conf.urls import patterns, url
from data.models import Post
from detail import views

urlpatterns = patterns('',
	url(r'^(\d+)/$',views.detail),
	url(r'^(?P<post_id>\d+)/add_comment/$',views.add_comment),
)
