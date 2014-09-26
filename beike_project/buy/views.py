from django.http import Http404,HttpResponse
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from data.models import BuyPost,User,Category, District
from data.views import get_user, get_category, get_district
from datetime import datetime
from user.session_util import is_request_valid
from beike_project import settings
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.gis.geos import Point
from buy.buy_post_util import BuyPostUtil
from data.data_util import get_contact
from django.contrib.gis.measure import D
from django.db.models import Q

NUM_PER_PAGE = settings.NUM_BUY_POST_PER_PAGE

def all_list(request):
    return render_to_response('buy_posts.html', {'num_per_page': NUM_PER_PAGE})

def get_posts_by_page(request):
    if request.is_ajax():
        page_num = request.GET.get('pageNum')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')
        category = request.GET.get('category')
        keyword = request.GET.get('keyword', '')
        origin = Point(float(longitude), float(latitude), srid=4326)
        #TO-DO, filter more based on city or distance
        query_set = BuyPost.objects.filter(is_open=True).distance(origin).order_by('distance')
        if category != '':
            query_set = query_set.filter(category__id=category)
        if keyword != '':
            query_set = query_set.filter(Q(content__icontains=keyword)|Q(title__icontains=keyword))
        #TO-DO: make the record count configurable
        paginator = Paginator(query_set, 20)

        try:
            buy_posts = paginator.page(page_num)
        except PageNotAnInteger:
            # if page is not an integer, deliver the first page
            buy_posts = {}
        except EmptyPage:
            # if page is out of range, deliever the last page
            buy_posts = {}

        buy_post_summaries = []
        for post in buy_posts:
            buy_post_summaries.append(get_buy_post_summary(post, origin))
        data = json.dumps(buy_post_summaries, cls=DjangoJSONEncoder)
        return HttpResponse(data)
    else:
        raise Http404

def get_buy_post_summary(post, origin):
    if isinstance(post, BuyPost):
        # transform to srid 3857
        origin.transform(3857)
        post.latlon.transform(3857)
        buy_post_summary = {
            'post_id': post.id,
            'title': post.title,
            'min_price': post.min_price,
            'max_price': post.max_price,
            'date_published': post.date_published,
            'distance': "{0:.2f}".format(D(m = origin.distance(post.latlon)).mi)
        }
        return buy_post_summary
    else:
        raise ValueError("Argument should be an BuyPost instance.")

def follow_post(request):
    if request.is_ajax:
        if not is_request_valid(request):
            return HttpResponseRedirect('/user/user_guide')
        wx_id = request.session['wx_id']
        user = get_user(wx_id)

        buy_post_util = BuyPostUtil()
        post_id = request.GET.get('post_id')
        post = buy_post_util.get_post(post_id)

        is_followed = request.GET.get('is_followed')
        if is_followed == 'True':
            buy_post_util.follow_post(user, post)
            return HttpResponse("{}")
        elif is_followed == 'False':
            buy_post_util.unfollow_post(user, post)
            return HttpResponse("{}")
        else:
            raise ValidationError("Operation not supported")
    else:
        raise ValidationError("Request not supported")

def form(request):
    if not is_request_valid(request):
        return HttpResponseRedirect('/user/user_guide')
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    categories = Category.objects.all()
    districts = District.objects.all()
    return render_to_response('buy_form.html',{'user':user, 'categories':categories, 'districts':districts},RequestContext(request))

def form_submit(request):
    if not is_request_valid(request):
        return HttpResponseRedirect('/user/user_guide')
    wx_id = request.session['wx_id']
    user = User.objects.get(wx_id=wx_id)
    if request.method == 'POST':
        title = request.POST.get('title','')
        content = request.POST.get('content','')
        category_id = int(request.POST.get('category'))
        min_price = 0
        max_price = request.POST.get('price')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        latlon = Point(float(longitude), float(latitude))

        phone_checked = request.POST.get('phone-checked', 'off')
        email_checked = request.POST.get('email-checked', 'off')
        sms_checked = request.POST.get('sms-checked', 'off')
        phone_number = request.POST.get('phone_number','')
        email = request.POST.get('email','')

        new_post = BuyPost()
        new_post.id = None
        new_post.is_open = True
        new_post.preferred_contacts = get_contact(phone_checked,email_checked,sms_checked,phone_number,email)
        new_post.date_published = datetime.now()
        new_post.title = title
        new_post.min_price = min_price
        new_post.max_price = max_price
        new_post.latlon = latlon
        new_post.user = user
        new_post.category = get_category(category_id)
        new_post.content = content
        new_post.save()

        if user.mobile_phone is None: 
            user.mobile_phone = phone_number
            user.save()

        return HttpResponseRedirect('/mine/')
    else: 
        raise Http404

def toggle_post(request):
    if request.is_ajax:
        if not is_request_valid(request):
            return HttpResponseRedirect('/user/user_guide')
        wx_id = request.session['wx_id']
        user = get_user(wx_id)

        buy_post_util = BuyPostUtil()
        post_id = request.GET.get('post_id')
        post = buy_post_util.get_post(post_id)

        if user.id == post.user.id:
            is_open = request.GET.get('is_open')
            if is_open == 'True':
                post.is_open = True
                post.save()
                return HttpResponse("{}")
            elif is_open == 'False':
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

