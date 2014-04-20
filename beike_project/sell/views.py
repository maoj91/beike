from django.http import Http404,HttpResponse
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from data.models import SellPost,User,Category,Condition
from data.views import get_user, get_category
from django.forms.formsets import formset_factory
from beike_project.views import check_wx_id
from datetime import datetime 
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.gis.geos import Point
from sell.sell_post_util import SellPostUtil
from sell.image_util import ImageMetadata
import logging

logger = logging.getLogger(__name__)

def index(request):
    return HttpResponse('sell');

def all_list(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    return render_to_response('sell.html', {'user_id':wx_id })

def get_posts_by_page(request):
    if request.is_ajax():
        page_num = request.GET.get('pageNum')
        sell_list = SellPost.objects.order_by('-date_published')
        #TO-DO: make the record count configurable
        paginator = Paginator(sell_list, 6)
        try:
            sell_posts = paginator.page(page_num)
        except PageNotAnInteger:
            # if page is not an integer, deliver the first page
            sell_posts = {}
        except EmptyPage:
            # if page is out of range, deliever the last page
            sell_posts = {}
        print sell_posts
        sell_post_summaries = []
        for post in sell_posts:
            sell_post_summaries.append(get_sell_post_summary(post))
        data = json.dumps(sell_post_summaries, cls=DjangoJSONEncoder)
        return HttpResponse(data)
    else:
        raise Http404

def follow_post(request):
    if request.is_ajax:
        check_wx_id(request)
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
            raise Http500
    else:
        raise Http500

def get_sell_post_summary(post):
    if isinstance(post, SellPost):
        sell_post_summary = {
            'post_id': post.id,
            'title': post.title,
            'price': post.price,
            'date_published': post.date_published,
        }
        return sell_post_summary
    else:
        raise ValueError("Argument should be an SellPost instance.")

def form(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    #retrieve all the categories
    categories = Category.objects.all();
    return render_to_response('form.html',{'user_id':wx_id, 'categories':categories},RequestContext(request)); 


def form_submit(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    error = ''
    if request.method == 'POST':
        new_post = SellPost()
        new_post.date_published = datetime.now()
        new_post.user = get_user(wx_id)
        #get image urls 
        category_id = int(request.POST.get('category',''))
        new_post.category = get_category(category_id)
        new_post.title = request.POST.get('title','')
        new_post.content = request.POST.get('content','')
        new_post.price = request.POST.get('price','')
        condition_id = request.POST.get('my_condition',1) 
        new_post.item_condition = Condition.objects.all()[int(condition_id)]
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        new_post.latlon = Point(float(longitude), float(latitude))
        new_post.image_urls = get_image_info(request)
        new_post.save()
        return HttpResponseRedirect('/history/')
    else:
        raise Http500

def get_image_info(request):
    image_list = []

    # process image1
    image_url1 = request.POST.get('image_url1')
    image_width1 = request.POST.get('image_width1')
    image_height1 = request.POST.get('image_height1')
    if image_url1 and image_width1 and image_height1:
        image1 = ImageMetadata(image_url1, image_width1, image_height1)
        image_list.append(image1)

    # process image2
    image_url2 = request.POST.get('image_url2')
    image_width2 = request.POST.get('image_width2')
    image_height2 = request.POST.get('image_height2')
    if image_url2 and image_width2 and image_height2:
        image2 = ImageMetadata(image_url2, image_width2, image_height2)
        image_list.append(image2)

    # process image3
    image_url3 = request.POST.get('image_url3')
    image_width3 = request.POST.get('image_width3')
    image_height3 = request.POST.get('image_height3')
    if image_url3 and image_width3 and image_height3:
        image3 = ImageMetadata(image_url3, image_width3, image_height3)
        image_list.append(image3)

    return ImageMetadata.serialize_list(image_list)

