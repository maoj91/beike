from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import Post
from data.models import User
from data.views import get_user
import datetime

def my_list(request,user_id):
	my_list = Post.objects.filter(user__wx_id=user_id).order_by('-date_published')
	return render_to_response('history.html', {'my_list':my_list,'user_id':user_id })



