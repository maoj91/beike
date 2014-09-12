from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from data.models import BuyPost, SellPost
from data.models import User
from data.views import get_user, get_buy_posts
from beike_project.views import validate_user
from buy.buy_post_util import BuyPostUtil
from sell.sell_post_util import SellPostUtil
from data.views import get_user
import json, logging

logger = logging.getLogger('mine.views')

def index(request):
    if 'wx_id' not in request.session or 'key' not in request.session:
        return HttpResponseRedirect('/user/get_info/')
    validate_user(request)
    wx_id = request.session['wx_id']
    user = get_user(wx_id)
    image = json.loads(user.image_url)[0]
    
    buy_post_util = BuyPostUtil()
    sell_post_util = SellPostUtil()

    sell_posts = SellPost.objects.filter(user__wx_id=wx_id).order_by('-date_published')
    logger.info("Fetched " + str(len(sell_posts)) + " sell posts for user " + str(user.id))
    buy_posts = BuyPost.objects.filter(user__wx_id=wx_id).order_by('-date_published')
    logger.info("Fetched " + str(len(buy_posts)) + " buy posts for user " + str(user.id))

    followed_sell_posts = sell_post_util.get_followed_posts(user)
    logger.info("Fetched " + str(len(followed_sell_posts)) + " sell posts followed by user " + str(user.id))
    followed_buy_posts = buy_post_util.get_followed_posts(user)
    logger.info("Fetched " + str(len(followed_buy_posts)) + " buy posts followed by user " + str(user.id))

    return render_to_response('mine.html',
    	{'image':image,'sell_posts':sell_posts, 'buy_posts':buy_posts,
    	 'followed_sell_posts':followed_sell_posts, 'followed_buy_posts':followed_buy_posts,
    	 'user_id':wx_id,'user':user },
    	RequestContext(request))



