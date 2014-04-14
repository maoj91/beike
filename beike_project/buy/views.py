from django.http import Http404,HttpResponse
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from data.models import BuyPost,User,Category, District
from data.views import get_user, get_category, get_district
from datetime import datetime
from beike_project.views import check_wx_id
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.gis.geos import Point
from buy.buy_post_util import BuyPostUtil


def all_list(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    return render_to_response('buy.html', {'user_id':wx_id })

def get_posts_by_page(request):
    if request.is_ajax():
        page_num = request.GET.get('pageNum')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')
        origin = Point(float(longitude), float(latitude))
        #TO-DO, filter more based on city or distance
        query_set = BuyPost.objects.distance(origin).order_by('distance')
        #TO-DO: make the record count configurable
        paginator = Paginator(query_set, 6)
        try:
            buy_posts = paginator.page(page_num)
        except PageNotAnInteger:
            # if page is not an integer, deliver the first page
            buy_posts = {}
        except EmptyPage:
            # if page is out of range, deliever the last page
            buy_posts = {}
        print buy_posts
        buy_post_summaries = []
        for post in buy_posts:
            buy_post_summaries.append(get_buy_post_summary(post))
        data = json.dumps(buy_post_summaries, cls=DjangoJSONEncoder)
        return HttpResponse(data)
    else:
        raise Http404

def follow_post(request):
    if request.is_ajax:
        check_wx_id(request)
        wx_id = request.session['wx_id']
        user = get_user(wx_id)

        buy_post_util = BuyPostUtil()
        post_id = request.GET.get('post_id')
        post = buy_post_util.get_post(post_id)

        follow_option = request.GET.get('follow_option')
        if follow_option == 'follow':
            buy_post_util.follow_post(user, post)
            return HttpResponse("{}")
        elif follow_option == 'unfollow':
            buy_post_util.unfollow_post(user, post)
            return HttpResponse("{}")
        else:
            raise Http500
    else:
        raise Http500

def get_buy_post_summary(post):
    if isinstance(post, BuyPost):
        buy_post_summary = {
            'post_id': post.id,
            'title': post.title,
            'min_price': post.min_price,
            'max_price': post.max_price,
            'date_published': post.date_published,
        }
        return buy_post_summary
    else:
        raise ValueError("Argument should be an BuyPost instance.")

def form(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    categories = Category.objects.all()
    districts = District.objects.all()
    return render_to_response('buy_form.html',{'categories':categories, 'districts':districts},RequestContext(request))

def form_submit(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    if request.method == 'POST':
        title = request.POST.get('title','')
        content = request.POST.get('content','')
        category_id = int(request.POST.get('category'))
        min_price = request.POST.get('min_price')
        max_price = request.POST.get('max_price')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        latlon = Point(float(longitude), float(latitude))

        phone_checked = request.POST.get('phone-checked', 'off')
        email_checked = request.POST.get('email-checked', 'off')
        qq_checked = request.POST.get('qq-checked', 'off')
        phone_number = request.POST.get('phone_number','')
        email = user.email
        qq_number = request.POST.get('qq_number','')
        contact = get_contact(phone_checked,email_checked,qq_checked,phone_number,email,qq_number)

        new_post = BuyPost()
        new_post.id = None
        new_post.is_open = True
        new_post.preferred_contacts = json.loads(contact)
        new_post.date_published = datetime.now()
        new_post.title = title
        new_post.min_price = min_price
        new_post.max_price = max_price
        new_post.latlon = latlon
        new_post.user = get_user(wx_id)
        new_post.category = get_category(category_id)
        new_post.content = content
        new_post.save()
        return HttpResponseRedirect('/history/')
    else: 
        raise Http404

# this could be shared by sell post
def get_contact(phone_checked,email_checked,qq_checked,phone_number,email,qq_number):
        contact = {
            'phone_checked': phone_checked,
            'email_checked': email_checked,
            'qq_checked': qq_checked,
            'phone_number': phone_number,
            'email': email,
            'qq_number': qq_number,
        }
        return json.dumps(contact, cls=DjangoJSONEncoder)


