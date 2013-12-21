from django.conf.urls import patterns, url
from history import views

urlpatterns = patterns('',
	url(r'^$',views.my_list),
#	url(r'^detail/(\d+)/$',views.detail),
)
