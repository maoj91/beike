from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import SellPost, BuyPost, User
from data.views import get_user
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
    contact = json.loads(post.preferred_contacts)
    phone_checked = contact['phone_checked'] == 'on'
    email_checked = contact['email_checked'] == 'on'
    qq_checked = contact['qq_checked'] == 'on' 
    phone = contact['phone_number']
    email = contact['email']
    qq = contact['qq_number']
    return render_to_response('sell_post_detail.html', {'post':post,'lat':lat,'lon':lon,'is_open':is_open, 'image_list': image_list, 'image_num':image_num,
        'is_followed': is_followed, 'wx_id':wx_id, 'is_owner': is_owner,'phone_checked':phone_checked,'email_checked':email_checked,'qq_checked':qq_checked,'phone':phone,
        'email':email,'qq':qq})

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
    qq_checked = contact['qq_checked'] == 'on' 
    phone = contact['phone_number']
    email = contact['email']
    qq = contact['qq_number']
    return render_to_response('buy_post_detail.html', {'post':post, 'is_open':is_open,'is_followed': is_followed, 'wx_id':wx_id, 'is_owner': is_owner,
        'phone_checked':phone_checked,'email_checked':email_checked,'qq_checked':qq_checked,'phone':phone,
        'email':email,'qq':qq})
