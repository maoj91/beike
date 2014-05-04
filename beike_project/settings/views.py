# -*- coding: utf-8 -*-
from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Area
from django.views.decorators.csrf import csrf_exempt

def index(request,user_id):
	user = User.objects.get(wx_id=user_id)
	states = State.objects.values('name')
	current_state = user.area.state_or_region
	cities = City.objects.filter(state__name=current_state)
	return render_to_response('settings.html',{'user':user,'states':states,'cities':cities})

@csrf_exempt
def save_profile(request,user_id):
	user = User.objects.get(wx_id=user_id)
	error = ""
 	if request.method == 'POST':
		user_name = request.POST.get('user_name','')	
		user_email = request.POST.get('user_email','')
		area_city = request.POST.get('area_city','')
		area_state = request.POST.get('area_state','')
		error = validate_profile(user_name,user_email,area_city,area_state)
		if(error == ""):
			user.name = user_name
			user.email = user_email
			user.area.city = area_city
			user.area.state_or_region = area_state
			user.save()
	return HttpResponseRedirect('/'+user.wx_id+'/settings/',{'user':user,'error':error})
	


def validate_profile(user_name,user_email,area_city,area_state):
	error = ""
	if user_name=="" or user_email=="" or area_city=="" or area_state=="":
		error = "请检查您的输入"
	#validate more
	return error
	
