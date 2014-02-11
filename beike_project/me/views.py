#-*- coding: utf-8 -*-
from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Area,Notification,Privacy
from django.views.decorators.csrf import csrf_exempt
from data.views import create_user,is_email_valid
import re
def index(request,user_id):
	user = User.objects.get(wx_id=user_id)
	states = State.objects.values('name')
	current_state = user.area.state_or_region
	cities = City.objects.filter(state__name=current_state)
	notifications = Notification.objects.values('description')
	privacies = Privacy.objects.values('description')
	return render_to_response('me.html',{'user':user,'states':states,'cities':cities,'notifications':notifications,'privacies':privacies})

def get_area(request,user_id):
	cities = City.objects.all()
	return render_to_response('get_area.html',{'user_id':user_id,'cities':cities})

def get_email(request,user_id,city_id):
	return render_to_response('get_email.html',{'user_id':user_id,'city_id':city_id})

def get_name(request,user_id):
	return render_to_response('get_name.html')

@csrf_exempt
def create(request,user_id):
 	if request.method == 'POST':
		city_id = request.POST.get('city_id','')	
		email = request.POST.get('user_email','')
	error = ''
	if is_email_valid(email):
		create_user(user_id,email,city_id)
		return HttpResponseRedirect('/'+user_id)
	else: 
		error = 'Email is not vaid. Please try again.'	
		return HttpResponseRedirect('/'+user_id+'/me/get_email/',{'user_id':user_id,'city_id':city_id,'error':error})


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
	        states = State.objects.values('name')
 		current_state = user.area.state_or_region
      		cities = City.objects.filter(state__name=current_state)
        	notifications = Notification.objects.values('description')
        	privacies = Privacy.objects.values('description')
       
       	        return render_to_response('me.html',{'user':user,'states':states,'cities':cities,'notifications':notifications,'privacies':privacies,'error': error})
	return HttpResponseRedirect('/'+user.wx_id+'/me/save_profile/',{'user':user,'error':error})
		
	
@csrf_exempt
def save_notification(request,user_id):
	user = User.objects.get(wx_id=user_id)
	error = ""
	if request.method == 'POST':
		nt_description = request.POST.get('notification','')
		notification = Notification.objects.get(description=nt_description)	
		if notification is None:
			error = 'Can not find notification'
		if(error == ""):
			user.notification = notification
			user.save()
	return HttpResponseRedirect('/'+user.wx_id+'/me/',{'user':user,'error':error})

@csrf_exempt
def save_privacy(request,user_id):
	user = User.objects.get(wx_id=user_id)
	error = ""
	if request.method == 'POST':
		privacy_des = request.POST.get('privacy','')
		privacy = Privacy.objects.get(description=privacy_des)	
		if privacy is None:
			error = 'Can not find privacy'
		if(error == ""):
			user.privacy = privacy
			user.save()
	return HttpResponseRedirect('/'+user.wx_id+'/me/',{'user':user,'error':error})



def validate_profile(user_name,user_email,area_city,area_state):
	error = ""
	if user_name=="bloody" or user_email=="" or area_city=="" or area_state=="":
		error = "请检查您的输入"
	#validate more
	if not re.match(r"[^@]+@[^@]+\.[^@]+", user_email):
		error = "请检查邮箱输入"
	return error
	
