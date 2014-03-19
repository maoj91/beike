from django.http import Http404,HttpResponse
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from data.models import BuyPost,User,Category, District
from data.views import get_user, get_category, get_district
from datetime import datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def all_list(request,user_id):
    buy_list = BuyPost.objects.order_by('-date_published')
    paginator = Paginator(buy_list, 4)
    page = request.GET.get('page')
    try:
        buy_posts = paginator.page(page)   
    except PageNotAnInteger:
        # if page is not an integer, deliver the first page
        buy_posts = paginator.page(1)
    except EmptyPage:
        # if page is out of range, deliever the last page
        buy_posts = paginator.page(paginator.num_pages)

    return render_to_response('buy.html', {'buy_posts':buy_posts,'user_id':user_id })

def form(request,user_id):
    #retrieve all the categories
    categories = Category.objects.all()
    districts = District.objects.all()
    return render_to_response('buy_form.html',{'user_id':user_id, 'categories':categories, 'districts':districts})

@csrf_exempt
def form_submit(request,user_id):
    if request.method == 'POST':
        title = request.POST.get('title','')
        content = request.POST.get('content','')
        category_id = int(request.POST.get('category'))
        district_id = int(request.POST.get('category'))
        min_price = request.POST.get('min_price','')
        max_price = request.POST.get('max_price','')
        phone = request.POST.get('phone','')
        open_until = request.POST.get('open_until_date','')
        new_post = BuyPost()
        new_post.id = None
        new_post.date_published = datetime.now()
        new_post.min_price = min_price
        new_post.max_price = max_price
        new_post.open_until = datetime.strptime(open_until,'%Y-%m-%d')
        new_post.user = get_user(user_id)
        new_post.district = get_district(district_id)
        new_post.title = title
        new_post.category = get_category(category_id)
        new_post.content = content
        new_post.save()
        return HttpResponseRedirect('/'+user_id+'/history/')
    else: 
        raise Http404

