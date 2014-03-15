from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import BuyPost, SellPost
from data.models import User
from data.views import get_user
import datetime

def my_list(request,user_id):
	sell_posts = SellPost.objects.filter(user__wx_id=user_id).order_by('-date_published')
	buy_posts = BuyPost.objects.filter(user__wx_id=user_id).order_by('-date_published')
	return render_to_response('history.html', {'sell_posts':sell_posts, 'buy_posts':buy_posts,'user_id':user_id })



