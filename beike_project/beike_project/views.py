from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Privacy,UserValidation
from data.views import get_user, create_user
from user.session_util import is_request_valid

def index(request):
	if is_request_valid(request):
		user = get_user(request.session['wx_id'])
		#TO-DO: fix city issue
		if not user:
			create_user(request.session['wx_id'])
		return render_to_response('index.html',{'user':user, 'city': ''})
			
	else:
		return HttpResponseRedirect('/user/user_guide')

def healthcheck(request):
	return render_to_response('health_check.html')
