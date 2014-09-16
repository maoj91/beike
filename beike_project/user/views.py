# -*- coding: utf-8 -*-
from django.http import Http404, HttpResponse
from django.core.exceptions import ValidationError
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from data.models import User,Country,State,City,District,Address,Privacy
from data.views import create_user,is_email_valid, is_name_valid, update_user_address
from beike_project.views import validate_user
from geolocation import get_geolocation_by_latlong, get_geolocation_by_zipcode    
import json, logging
from django.core.serializers.json import DjangoJSONEncoder
from data.image_util import ImageMetadata
from django.contrib.gis.geos import Point
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from datetime import date

LOGGER = logging.getLogger('user.views')

def index(request,offset):
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(id=offset)
    is_owner = user.wx_id == wx_id
    states = State.objects.values('name')
    cities = City.objects.all()
    privacies = Privacy.objects.values('description')
    user_image = ImageMetadata.deserialize_list(user.image_url)[0]
    age = get_age(user.date_of_birth)
    return render_to_response('user.html',{'user':user,'is_owner':is_owner,'user_image':user_image,'states':states,'cities':cities,'age':age},RequestContext(request))


def edit(request,offset):
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(id=offset)
    is_owner = user.wx_id == wx_id
    states = State.objects.values('name')
    cities = City.objects.all()
    privacies = Privacy.objects.values('description')
    user_image = ImageMetadata.deserialize_list(user.image_url)[0]
    return render_to_response('user_edit.html',{'user':user,'is_owner':is_owner,'user_image':user_image,'states':states,'cities':cities},RequestContext(request))


def edit_address(request,offset):
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(id=offset)
    return render_to_response('user_edit_address.html',{'user':user},RequestContext(request))

def save_address(request, offset):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(id=offset)
    if request.method == 'POST':
        city_id = request.POST.get('city_id')
        zipcode = request.POST.get('zipcode')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')     
        update_user_address(user.id, city_id, zipcode, latitude, longitude)
        return HttpResponseRedirect('/user/'+str(user.id))

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
        email = request.POST.get('email_input')
        name = request.POST.get('username_input')
        email_valid_type = is_email_valid(email)
        name_valid_type = is_name_valid(name)
        if email_valid_type ==0 and email_valid_type==0:
            LOGGER.info("Creating [user: %s, email: %s, zipcode: %s, latitude: %s, longitude: %s]."
                % (name, email, zipcode, latitude, longitude ))
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

def update(request,offset):
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(id=offset)
    is_owner = user.wx_id == wx_id
    if request.method == 'POST':
        user.name = request.POST.get('name','')    
        user.email = request.POST.get('email','')
        user.organization = request.POST.get('organization','')    
        user.description = request.POST.get('description','')   
        user.mobile_phone = request.POST.get('mobile_phone','')   
        user.gender = int(request.POST.get('gender',''))
        dob = request.POST.get('date_of_birth','')
        if dob: 
            user.date_of_birth = datetime.strptime(dob, '%Y-%m-%d')
        new_image = get_image_info(request)      
        if new_image:
            user.image_url = new_image
        user.save()
    user_image = ImageMetadata.deserialize_list(user.image_url)[0]
    states = State.objects.values('name')
    cities = City.objects.all()
    privacies = Privacy.objects.values('description')
    return HttpResponseRedirect('/user/'+str(offset),{'user':user,'is_owner':is_owner,'user_image':user_image,'states':states,'cities':cities,'privacies':privacies},RequestContext(request))

def get_info(request):
    if 'wx_id' not in request.session or 'key' not in request.session: 
        return render_to_response('get_info.html',RequestContext(request))
    validate_user(request)
    wx_id = request.session['wx_id']
    return render_to_response('get_info.html',{'user_id':wx_id},RequestContext(request))

# Utilize latitude and longitude to retrieve location information
# including district, city, state, country etc.
# Internally it is calling Google geolocation service
def get_and_create_location_by_latlong(request):
    if request.is_ajax():
        latitude = float(request.GET.get('latitude'))
        longitude = float(request.GET.get('longitude'))
        LOGGER.info('Getting and creating location using latlon: (' + str(latitude) + ', ' + str(longitude) + ')')
        geolocation = get_geolocation_by_latlong(latitude, longitude)
        # Create the state/city/district if they don't exist yet in DB.
        result = create_location_if_not_exist(geolocation)
        return HttpResponse(json.dumps(result, cls=DjangoJSONEncoder))
    else:
        raise ValidationError("Operation is not allowed")

def get_location_by_latlong(request):
    if request.is_ajax():
        latitude = float(request.GET.get('latitude'))
        longitude = float(request.GET.get('longitude'))
        LOGGER.info('Getting location using latlon: (' + str(latitude) + ', ' + str(longitude) + ')')
        geolocation = get_geolocation_by_latlong(latitude, longitude)
        return HttpResponse(json.dumps(geolocation.to_json(), cls=DjangoJSONEncoder))
    else:
        raise ValidationError("Operation is not allowed")

# Utilize zipcode to retrieve location information
# including district, city, state, country etc.
# Internally it is calling Google geolocation service
def get_and_create_location_by_zipcode(request):
    if request.is_ajax():
        zipcode = request.GET.get("zipcode")
        LOGGER.info('Getting and possibily creating location using zipcode:' + str(zipcode))
        geolocation = get_geolocation_by_zipcode(zipcode)
        result = create_location_if_not_exist(geolocation)
        return HttpResponse(json.dumps(result, cls=DjangoJSONEncoder))
    else:
        raise ValidationError("Operation is not allowed")

def get_location_by_zipcode(request):
    if request.is_ajax():
        zipcode = request.GET.get("zipcode")
        LOGGER.info('Getting location using zipcode:' + str(zipcode))
        geolocation = get_geolocation_by_zipcode(zipcode)
        return HttpResponse(json.dumps(geolocation.to_json(), cls=DjangoJSONEncoder))
    else:
        raise ValidationError("Operation is not allowed")

def create_location_if_not_exist(geolocation):
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

    result = geolocation.to_json()
    # adding some some location object ids
    result['city_id'] = city.id
    result['state_id'] = state.id
    result['lv1_district_id'] = lv1_district.id
    return result

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
    return HttpResponseRedirect('/user/',{'user':user,'error':error})

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
    if image_url and image_width and image_height:
        image = ImageMetadata(image_url, image_width, image_height)
        image_list.append(image)
        return ImageMetadata.serialize_list(image_list)
    else: 
        return '';

def get_age(born):
    if born:
        today = date.today()
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    else: 
        return '';
