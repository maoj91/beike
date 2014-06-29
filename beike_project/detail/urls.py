from django.conf.urls import patterns, url
from detail import views

urlpatterns = patterns('',
	url(r'sell/(\d+)/$',views.sell_post_detail),
	url(r'sell/(\d+)/edit/$',views.sell_detail_edit),
	url(r'sell/(\d+)/save/$',views.sell_detail_save),
	url(r'buy/(\d+)/$',views.buy_post_detail),
	url(r'buy/(\d+)/edit/$',views.buy_detail_edit),
	url(r'buy/(\d+)/save/$',views.buy_detail_save),
)
