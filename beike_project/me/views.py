# -*- coding: utf-8 -*-
from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from data.models import User,Country,State,City,District,Address,Notification,Privacy
from data.views import create_user,is_email_valid
from beike_project.views import check_wx_id
from geolocation import get_location_by_latlong, get_location_by_zipcode    
import json, logging
from django.core.serializers.json import DjangoJSONEncoder


def index(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    states = State.objects.values('name')
    cities = City.objects.all()
    notifications = Notification.objects.values('description')
    privacies = Privacy.objects.values('description')
    return render_to_response('me.html',{'user':user,'states':states,'cities':cities,'notifications':notifications,'privacies':privacies},RequestContext(request))

def get_info(request):
    # wx_id = request.GET.get('wx_id')
    # if wx_id is None:
    #     raise Http404
    # else:
    #     request.session['wx_id'] = wx_id
    check_wx_id(request)
    wx_id = request.session['wx_id']
    cities = City.objects.all()
    return render_to_response('get_info.html',{'user_id':wx_id,'cities':cities,'default_city':'Seattle'},RequestContext(request))

def get_city_by_latlong(request):
    if request.is_ajax():
        latitude = float(request.GET.get('latitude'))
        longitude = float(request.GET.get('longitude'))
        print("latitude: " + request.GET.get('latitude') + ", longitude: " + request.GET.get('longitude'))
        geolocation = get_location_by_latlong(latitude, longitude)
        city_district = get_city_district(geolocation)
        return HttpResponse(json.dumps(city_district, cls=DjangoJSONEncoder))
    else:
        raise Http404

def get_zipcode_by_latlong(request):
    if request.is_ajax():
        latitude = float(request.GET.get('latitude'))
        longitude = float(request.GET.get('longitude'))
        print("latitude: " + request.GET.get('latitude') + ", longitude: " + request.GET.get('longitude'))
        geolocation = get_location_by_latlong(latitude, longitude)
        return HttpResponse(json.dumps({'zipcode': geolocation.zipcode}, cls=DjangoJSONEncoder))
    else:
        raise Http404

def get_city_by_zipcode(request):
    if request.is_ajax():
        zipcode = request.GET.get("zipcode")
        geolocation = get_location_by_zipcode(zipcode)
        city_district = get_city_district(geolocation)
        return HttpResponse(json.dumps(city_district, cls=DjangoJSONEncoder))
    else:
        raise Http404

def get_name(request):
    return render_to_response('get_name.html')

def create(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    cities = City.objects.all()
    default_city = cities[0]
    error = ''
    email_valid_type = 0;
    if request.method == 'POST':
        city_id = request.POST.get('city_id','')    
        email = request.POST.get('user_email','')
        default_city = cities.get(id=city_id)
        email_valid_type = is_email_valid(email)
        if email_valid_type ==0:
            print wx_id + " " + email + " " + city_id
            create_user(wx_id,email,city_id)
            return HttpResponseRedirect('/')
        else: 
            if email_valid_type == 1:
                error = 'Email is not valid. Please try again.' 
            if email_valid_type == 2: 
                error = 'Email already exist.'
            return render_to_response('get_info.html',{'wx_id':wx_id,'cities':cities,'default_city':default_city,'error':error},RequestContext(request))
    else: 
        raise Http404


def save_profile(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
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
    return HttpResponseRedirect('/me/',{'user':user,'error':error})

def get_city_district(geolocation):
    # create the country if it does not yet exist DB
    try:
        country = Country.objects.get(name__iexact=geolocation.country)
    except Country.DoesNotExist:
        raise ValueError("Country " + geolocation.country + " is not allowed.")

    # create the state/province if it does not yet exist in DB
    try:
        state = State.objects.get(name__iexact=geolocation.state)
    except State.DoesNotExist:
        state = State(name=geolocation.state)
        state.country = country
        state.save()

    # create the city if it does not yet exist in DB
    try:
        city = City.objects.get(name__iexact=geolocation.city)
    except City.DoesNotExist:
        city = City(name=geolocation.city)
        city.state = state
        city.country = country
        city.save()

    # create the district if it does not yet exist in DB
    lv1_district = District()
    if geolocation.lv1_district is not None:
        try:
            lv1_district = District.objects.get(name__iexact=geolocation.lv1_district)
        except District.DoesNotExist:
            lv1_district = District(name=geolocation.lv1_district)
            lv1_district.city = city
            lv1_district.save()

    cityDistrict={'city_id': city.id, 'city_name': city.name,
        'lv1_district_id': lv1_district.id, 'lv1_district_name': lv1_district.name}
    return cityDistrict
    
def save_notification(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    error = ""
    if request.method == 'POST':
        nt_description = request.POST.get('notification','')
        notification = Notification.objects.get(description=nt_description) 
        if notification is None:
            error = 'Can not find notification'
        if(error == ""):
            user.notification = notification
            user.save()
    return HttpResponseRedirect('/me/',{'user':user,'error':error})

def save_privacy(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    error = ""
    if request.method == 'POST':
        privacy_des = request.POST.get('privacy','')
        privacy = Privacy.objects.get(description=privacy_des)  
        if privacy is None:
            error = 'Can not find privacy'
        if(error == ""):
            user.privacy = privacy
            user.save()
    return HttpResponseRedirect('/me/',{'user':user,'error':error})



def validate_profile(user_name,user_email,address_city,address_state):
    error = ""
    if user_name=="" or user_email=="" or address_city=="" or address_state=="":
        error = "请检查您的输入"
    #validate more
    return error
    
