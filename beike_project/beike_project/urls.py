from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	# Examples:
	# url(r'^$', 'beike_project.views.home', name='home'),
	# url(r'^beike_project/', include('beike_project.foo.urls')),

	# Uncomment the admin/doc line below to enable admin documentation:
	# url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

	# Uncomment the next line to enable the admin:
	url(r'^$', TemplateView.as_view(template_name='index.html'), name="home"),
	url(r'^admin/', include(admin.site.urls)),
	url(r'^demand/', include('demand.urls')),
	url(r'^supply/', include('supply.urls')),
	url(r'^polls/', include('polls.urls')),
)
