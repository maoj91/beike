from django.http import Http404,HttpResponse
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from data.models import BuyPost,User,Category, District
from data.views import get_user, get_category, get_district
from datetime import datetime
from beike_project.views import check_wx_id
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from django.core.serializers.json import DjangoJSONEncoder

def all_list(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    return render_to_response('buy.html', {'user_id':wx_id })

def get_posts_by_page(request):
    if request.is_ajax():
        page_num = request.GET.get('pageNum')
        buy_list = BuyPost.objects.order_by('-date_published')
        #TO-DO: make the record count configurable
        paginator = Paginator(buy_list, 6)
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
    return render_to_response('buy_form.html',{'categories':categories, 'districts':districts})

@csrf_exempt
def form_submit(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    if request.method == 'POST':
        title = request.POST.get('title','')
        content = request.POST.get('content','')
        category_id = int(request.POST.get('category'))
        min_price = request.POST.get('min_price')
        max_price = request.POST.get('max_price')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        phone_checked = request.POST.get('phone-contact', False)
        email_checked = request.POST.get('email-contact', False)
        qq_checked = request.POST.get('qq-contact', False)

        print phone_checked

        mobile_number = request.POST.get('mobile_number')
        qq_number = request.POST.get('qq_number')

        new_post = BuyPost()
        new_post.id = None
        new_post.is_open = True
        new_post.preferred_contacts = 'TO-DO'
        new_post.date_published = datetime.now()
        new_post.title = title
        new_post.min_price = min_price
        new_post.max_price = max_price
        new_post.latitude = latitude
        new_post.longitude = longitude
        new_post.user = get_user(wx_id)
        new_post.category = get_category(category_id)
        new_post.content = content
        new_post.save()
        return HttpResponseRedirect('/history/')
    else: 
        raise Http404

