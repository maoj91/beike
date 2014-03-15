# -*- coding: utf-8 -*-
from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Address,Notification,Privacy
from django.views.decorators.csrf import csrf_exempt
from data.views import create_user,is_email_valid

def index(request,user_id):
	user = User.objects.get(wx_id=user_id)
	states = State.objects.values('name')
	cities = City.objects.all()
	notifications = Notification.objects.values('description')
	privacies = Privacy.objects.values('description')
	return render_to_response('me.html',{'user':user,'states':states,'cities':cities,'notifications':notifications,'privacies':privacies})

def get_info(request,user_id):
	cities = City.objects.all()
	default_city = cities[0]
	return render_to_response('get_info.html',{'user_id':user_id,'cities':cities,'default_city':default_city})

def get_name(request,user_id):
	return render_to_response('get_name.html')

@csrf_exempt
def create(request,user_id):
	cities = City.objects.all()
	default_city = cities[0]
	error = ''
 	if request.method == 'POST':
		city_id = request.POST.get('city_id','')	
		email = request.POST.get('user_email','')
		default_city = cities.get(id=city_id)
		if is_email_valid(email):
			create_user(user_id,email,city_id)
			print 'email valid'
			return HttpResponseRedirect('/'+user_id)
		else: 
			print 'email invalid'
			error = 'Email is not valid. Please try again.'	
			return render_to_response('get_info.html',{'user_id':user_id,'cities':cities,'default_city':default_city,'error':error})
	else: 
		raise Http404

@csrf_exempt
def save_profile(request,user_id):
	user = User.objects.get(wx_id=user_id)
	error = ""
 	if request.method == 'POST':
		user_name = request.POST.get('user_name','')	
		user_email = request.POST.get('user_email','')
		address_city = request.POST.get('address_city','')
		address_state = request.POST.get('address_state','')
		error = validate_profile(user_name,user_email,address_city,address_state)
		if(error == ""):
			user.name = user_name
			user.email = user_email
			user.address.city = address_city
			user.address.state_or_region = address_state
			user.save()
	return HttpResponseRedirect('/'+user.wx_id+'/me/',{'user':user,'error':error})
	
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



def validate_profile(user_name,user_email,address_city,address_state):
	error = ""
	if user_name=="" or user_email=="" or address_city=="" or address_state=="":
		error = "请检查您的输入"
	#validate more
	return error
	
