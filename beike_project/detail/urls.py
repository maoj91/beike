from django.conf.urls import patterns, url
from detail import views

urlpatterns = patterns('',
	url(r'sell/(\d+)/$',views.sell_post_detail),
	url(r'buy/(\d+)/$',views.buy_post_detail),
	url(r'^(?P<post_id>\d+)/add_comment/$',views.add_comment),
)
