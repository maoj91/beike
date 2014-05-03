from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from data.models import BuyPost, SellPost
from data.models import User
from data.views import get_user, get_buy_posts
from beike_project.views import validate_user
import datetime
from buy.buy_post_util import BuyPostUtil
from sell.sell_post_util import SellPostUtil
from data.views import get_user
import json, logging

def index(request):
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    image = json.loads(user.image_url)[0]
    
    buy_post_util = BuyPostUtil()
    sell_post_util = SellPostUtil()

    sell_posts = SellPost.objects.filter(user__wx_id=wx_id).order_by('-date_published')
    buy_posts = BuyPost.objects.filter(user__wx_id=wx_id).order_by('-date_published')

    followed_sell_posts = sell_post_util.get_followed_posts(user)
    followed_buy_posts = buy_post_util.get_followed_posts(user)

    return render_to_response('mine.html',
    	{'image':image,'sell_posts':sell_posts, 'buy_posts':buy_posts,
    	 'followed_sell_posts':followed_sell_posts, 'followed_buy_posts':followed_buy_posts,
    	 'user_id':wx_id },
    	RequestContext(request))



