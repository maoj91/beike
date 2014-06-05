# -*- coding: utf-8 -*-
from django.http import Http404, HttpResponse
from django.core.exceptions import ValidationError
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from data.models import User,Country,State,City,District,Address,Privacy
from data.views import create_user,is_email_valid, is_name_valid
from beike_project.views import validate_user
from geolocation import get_location_by_latlong, get_location_by_zipcode    
import json, logging
from django.core.serializers.json import DjangoJSONEncoder
from data.image_util import ImageMetadata
from django.contrib.gis.geos import Point
from django.views.decorators.csrf import csrf_exempt


def index(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    states = State.objects.values('name')
    cities = City.objects.all()
    privacies = Privacy.objects.values('description')
    image = json.loads(user.image_url)[0]
    return render_to_response('me.html',{'user':user,'image':image,'states':states,'cities':cities,'privacies':privacies},RequestContext(request))

def get_info(request):
    validate_user(request)
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
        raise ValidationError("Operation is not allowed")

def get_latlon_by_zipcode(request):
    if request.is_ajax():
        zipcode = request.GET.get('zipcode')
        geolocation = get_location_by_zipcode(zipcode)
        return HttpResponse(json.dumps({'latitude': geolocation.latitude, 'longitude': geolocation.longitude,
            'city': geolocation.city}, cls=DjangoJSONEncoder))
    else:
        raise ValidationError("Operation is not allowed")

def get_zipcode_by_latlong(request):
    if request.is_ajax():
        latitude = float(request.GET.get('latitude'))
        longitude = float(request.GET.get('longitude'))
        print("latitude: " + request.GET.get('latitude') + ", longitude: " + request.GET.get('longitude'))
        geolocation = get_location_by_latlong(latitude, longitude)
        return HttpResponse(json.dumps({'zipcode': geolocation.zipcode, 'city': geolocation.city}, cls=DjangoJSONEncoder))
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

@csrf_exempt
def check_email(request):
    if request.method == 'POST':
        email = request.POST.get('user_email')
        user = User.objects.filter(email = email)
        if user:
            return HttpResponse('false')
        else:
            return HttpResponse('true')
    else:
        raise Http500


def create(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    error = ''
    email_valid_type = 0;
    if request.method == 'POST':
        city_id = request.POST.get('city_id')
        zipcode = request.POST.get('zipcode')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')  
        print "latitude: " + latitude
        print "longitude" + longitude
        email = request.POST.get('user_email')
        name = request.POST.get('user_name')
        email_valid_type = is_email_valid(email)
        name_valid_type = is_name_valid(name)
        if email_valid_type ==0 and email_valid_type==0:
            print wx_id + " " + email + " " + city_id
            create_user(wx_id, name, email, city_id, zipcode, latitude, longitude)
            return HttpResponseRedirect('/')
        else: 
            if email_valid_type == 1: 
                error += 'User name can not be empty.'
            if email_valid_type == 1:
                error += 'Email is not valid. Please try again.' 
            if email_valid_type == 2: 
                error += 'Email already exist.'
            return render_to_response('get_info.html',{'wx_id':wx_id,'cities':cities,'default_city':default_city,'error':error},RequestContext(request))
    else: 
        raise Http404

def update_profile_image(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    error = ""
    if request.method == 'POST':
        image_info = get_image_info(request)
        image_list = json.dumps(image_info)
        image = image_list[0]        
        user.image_url = image_info
        user.save()
        return HttpResponseRedirect('/me/',{'user':user,'error':error,'image':image})
    else: 
        raise Http404


def save_profile(request):
    validate_user(request)
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
        'lv1_district_id': lv1_district.id, 'lv1_district_name': lv1_district.name,
        'zipcode': geolocation.zipcode, 'latitude': geolocation.latitude, 'longitude': geolocation.longitude}
    return cityDistrict
    

def save_privacy(request):
    validate_user(request)
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


def get_image_info(request):
    image_list = []
    # process image
    image_url = request.POST.get('image_url')
    image_width = request.POST.get('image_width')
    image_height = request.POST.get('image_height')
    print image_url
    if image_url and image_width and image_height:
        image = ImageMetadata(image_url, image_width, image_height)
        image_list.append(image)
    return ImageMetadata.serialize_list(image_list)
    
