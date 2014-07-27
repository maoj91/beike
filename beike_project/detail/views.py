from django.http import Http404,HttpResponse
from django.template import RequestContext
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import SellPost, BuyPost, User, Category, Condition
from data.views import get_user, get_category
from data.data_util import get_contact, get_condition
from detail.forms import CommentForm
import smtplib
from email.mime.text import MIMEText
from beike_project.views import validate_user
from buy.buy_post_util import *
from sell.sell_post_util import *
from data.views import get_user
from sell.image_util import ImageMetadata
import datetime
import logging
import json

logger = logging.getLogger(__name__)


def sell_post_detail(request,offset):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    post = SellPost.objects.get(id=offset)
    lat = "{0:.6f}".format(post.latlon.coords[1])
    lon = "{0:.6f}".format(post.latlon.coords[0])
    image_list = ImageMetadata.deserialize_list(post.image_urls)
    image_num = len(image_list)
    sell_post_util = SellPostUtil()
    is_followed = sell_post_util.is_post_followed_by_user(user, post)
    is_open = post.is_open
    is_owner = user.id == post.user.id
    post_user = User.objects.get(id=post.user.id)
    post_user_id = post.user.id
    contact = json.loads(post.preferred_contacts)
    phone_checked = contact['phone_checked'] == 'on'
    email_checked = contact['email_checked'] == 'on'
    sms_checked = contact['sms_checked'] == 'on' 
    phone = contact['phone_number']
    email = contact['email']
    user_image = ImageMetadata.deserialize_list(post.user.image_url)[0]
    
    return render_to_response('sell_post_detail.html', {'post':post,'lat':lat,'lon':lon,'is_open':is_open, 'image_list': image_list, 'image_num':image_num,
        'is_followed': is_followed, 'wx_id':wx_id, 'is_owner': is_owner,'phone_checked':phone_checked,'email_checked':email_checked,'sms_checked':sms_checked,'phone':phone,
        'email':email,'user_image':user_image})


def sell_detail_edit(request,offset):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    post = SellPost.objects.get(id=offset)
    lat = "{0:.6f}".format(post.latlon.coords[1])
    lon = "{0:.6f}".format(post.latlon.coords[0])
    image_list = ImageMetadata.deserialize_list(post.image_urls)
    image_num = len(image_list)
    sell_post_util = SellPostUtil()
    is_followed = sell_post_util.is_post_followed_by_user(user, post)
    is_open = post.is_open
    is_owner = user.id == post.user.id
    post_user = User.objects.get(id=post.user.id)
    post_user_id = post.user.id
    contact = json.loads(post.preferred_contacts)
    phone_checked = contact['phone_checked'] 
    email_checked = contact['email_checked'] 
    sms_checked = contact['sms_checked']
    phone = contact['phone_number']
    email = contact['email']
    print sms_checked;
    print phone_checked;
    print email_checked;
    user_image = ImageMetadata.deserialize_list(post.user.image_url)[0]
    categories = Category.objects.all();
    return render_to_response('sell_detail_edit.html', {'post':post,'lat':lat,'lon':lon,'is_open':is_open, 'image_list': image_list, 'image_num':image_num,
        'is_followed': is_followed, 'wx_id':wx_id, 'is_owner': is_owner,'phone_checked':phone_checked,'email_checked':email_checked,'sms_checked':sms_checked,'phone':phone,
        'email':email,'user_image':user_image, 'categories':categories},RequestContext(request))

def sell_detail_save(request,offset):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    post = SellPost.objects.get(id=offset)
    if request.method == 'POST':
        phone_checked = request.POST.get('phone-checked', 'off')
        email_checked = request.POST.get('email-checked', 'off')
        sms_checked = request.POST.get('sms-checked', 'off')
        phone_number = request.POST.get('phone_number','')
        email = request.POST.get('email','')
        post.preferred_contacts = get_contact(phone_checked,email_checked,sms_checked,phone_number,email)
        category_id = int(request.POST.get('category',''))
        post.category = get_category(category_id)
        post.title = request.POST.get('title','')
        post.content = request.POST.get('content','')
        post.price = request.POST.get('price','')
        condition_value = request.POST.get('condition-slider',0) 
        post.item_condition = get_condition(condition_value)
        post.save()
        return HttpResponseRedirect('/detail/sell/'+str(post.id)+'/')
    else:
        raise Http404


def buy_detail_edit(request,offset):
    raise Http404()

def buy_detail_save(request,offset):
    raise Http404()


def buy_post_detail(request,offset):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    post = BuyPost.objects.get(id=offset)
    buy_post_util = BuyPostUtil()
    is_followed = buy_post_util.is_post_followed_by_user(user, post)
    is_open = post.is_open
    is_owner = user.id == post.user.id
    contact = json.loads(post.preferred_contacts)
    phone_checked = contact['phone_checked'] == 'on'
    email_checked = contact['email_checked'] == 'on'
    sms_checked = contact['sms_checked'] == 'on' 
    phone = contact['phone_number']
    email = contact['email']
    return render_to_response('buy_post_detail.html', {'post':post, 'is_open':is_open,'is_followed': is_followed, 'wx_id':wx_id, 'is_owner': is_owner,
        'phone_checked':phone_checked,'email_checked':email_checked,'sms_checked':sms_checked,'phone':phone,
        'email':email})
