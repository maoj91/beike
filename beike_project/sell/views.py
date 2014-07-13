from django.http import Http404,HttpResponse
from django.template import RequestContext
from django.core.exceptions import ValidationError
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from data.models import SellPost,User,Category,Condition
from data.views import get_user, get_category
from django.forms.formsets import formset_factory
from beike_project.views import validate_user
from datetime import datetime 
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.gis.geos import Point
from sell.sell_post_util import SellPostUtil
from data.image_util import ImageMetadata
from django.contrib.gis.measure import D
import logging
from data.data_util import get_contact, get_condition

logger = logging.getLogger(__name__)

def index(request):
    return HttpResponse('sell');

def all_list(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    return render_to_response('sell.html', {'user_id':wx_id })

def get_posts_by_page(request):
    if request.is_ajax():
        page_num = request.GET.get('pageNum')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')
        origin = Point(float(longitude), float(latitude), srid=4326)
        query_set = SellPost.objects.filter(is_open=True).distance(origin).order_by('distance')
        #TO-DO: make the record count configurable
        paginator = Paginator(query_set, 8)
        try:
            sell_posts = paginator.page(page_num)
        except PageNotAnInteger:
            # if page is not an integer, deliver the first page
            sell_posts = {}
        except EmptyPage:
            # if page is out of range, deliever the last page
            sell_posts = {}

        sell_post_summaries = []
        for post in sell_posts:
            sell_post_summaries.append(get_sell_post_summary(post, origin))
        data = json.dumps(sell_post_summaries, cls=DjangoJSONEncoder)
        return HttpResponse(data)
    else:
        raise ValidationError("Request not supported")

def follow_post(request):
    if request.is_ajax:
        validate_user(request)
        wx_id = request.session['wx_id']
        user = get_user(wx_id)

        sell_post_util = SellPostUtil()
        post_id = request.GET.get('post_id')
        post = sell_post_util.get_post(post_id)

        follow_option = request.GET.get('follow_option')
        if follow_option == 'follow':
            sell_post_util.follow_post(user, post)
            return HttpResponse("{}")
        elif follow_option == 'unfollow':
            sell_post_util.unfollow_post(user, post)
            return HttpResponse("{}")
        else:
            raise ValidationError("Operation not supported")
    else:
        raise ValidationError("Request not supported")

def open_close_post(request):
    if request.is_ajax:
        validate_user(request)
        wx_id = request.session['wx_id']
        user = get_user(wx_id)

        sell_post_util = SellPostUtil()
        post_id = request.GET.get('post_id')
        post = sell_post_util.get_post(post_id)
        if user.id == post.user.id:
            operation = request.GET.get('operation')
            if operation == 'open':
                post.is_open = True
                post.save()
                return HttpResponse("{}")
            elif operation == 'close':
                post.is_open = False
                post.date_closed = datetime.now()
                post.save()
                return HttpResponse("{}")
            else:
                raise ValidationError("Operation not supported")
        else:
            raise ValidationError("No permission to open or close the sell post")

    else:
        raise ValidationError("Request not supported")

def get_sell_post_summary(post, origin):
    if isinstance(post, SellPost):
        # transform to srid 900913
        try:
            origin.transform(900913)
        except Exception, E:
            raise Exception('%s: latlon was: %s' % (E, origin.latlon))
        try:
            post.latlon.transform(900913)
        except Exception, E:
            raise Exception('%s: latlon was: %s' % (E, post.latlon))
        
        sell_post_summary = {
            'post_id': post.id,
            'title': post.title,
            'price': post.price,
            'image_info': post.image_urls,
            'date_published': post.date_published,
            'distance': "{0:.2f}".format(D(m = origin.distance(post.latlon)).mi)
        }
        return sell_post_summary
    else:
        raise ValueError("Argument should be an SellPost instance.")

def form(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    categories = Category.objects.all();
    return render_to_response('form.html',{'user':user,'user_id':wx_id, 'categories':categories},RequestContext(request)); 


def form_submit(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    error = ''
    if request.method == 'POST':
        new_post = SellPost()
        new_post.date_published = datetime.now()

        new_post.user = user

        phone_checked = request.POST.get('phone-checked', 'off')
        email_checked = request.POST.get('email-checked', 'off')
        sms_checked = request.POST.get('sms-checked', 'off')
        phone_number = request.POST.get('phone_number','')
        email = request.POST.get('email','')

        new_post.preferred_contacts = get_contact(phone_checked,email_checked,sms_checked,phone_number,email)
        category_id = int(request.POST.get('category',''))
        new_post.category = get_category(category_id)
        new_post.title = request.POST.get('title','')
        new_post.content = request.POST.get('content','')
        new_post.price = request.POST.get('price','')
        condition_value = request.POST.get('condition-slider',0) 
        new_post.item_condition = get_condition(condition_value)
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        new_post.latlon = Point(float(longitude), float(latitude))
        new_post.image_urls = get_image_info(request)
        new_post.save()
        
        if user.mobile_phone is None: 
            user.mobile_phone = phone_number
            user.save()

        return HttpResponseRedirect('/mine/')
    else:
        raise Http500

def get_image_info(request):
    image_list = []
    for i in range(0, 2):
        image_url = request.POST.get('image_url' + str(i))
        image_width = request.POST.get('image_width' + str(i))
        image_height = request.POST.get('image_height' + str(i))
        image_orientation = request.POST.get('image_orientation' + str(i))
        if image_url and image_width and image_height and image_orientation:
            image = ImageMetadata(image_url, image_width, image_height, image_orientation)
            image_list.append(image)
    return ImageMetadata.serialize_list(image_list)

