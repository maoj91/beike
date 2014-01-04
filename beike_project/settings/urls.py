from django.conf.urls import patterns, url
from data.models import User
from settings import views
from django.views.generic import TemplateView

urlpatterns = patterns('',
	url(r'^$', TemplateView.as_view(template_name='settings.html'), name="home"),
)
