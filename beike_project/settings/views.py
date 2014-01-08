from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from data.models import User

def index(request,user_id):
	user = User.objects.get(wx_id=user_id)
	return render_to_response('settings.html',{'user':user})
