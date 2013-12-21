from django.conf.urls import patterns, url
from django.views.generic import ListView
from data.models import Post
from supply import views

urlpatterns = patterns('',
    url(r'^$', ListView.as_view(
		queryset=Post.objects.all(),
		template_name='supply.html')),
)
