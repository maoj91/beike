from django.http import Http404,HttpResponse
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt,csrf_protect
from data.models import SellPost,User,Category,Condition
from data.views import get_user, get_category
from django.forms.formsets import formset_factory
from beike_project.views import check_wx_id
from datetime import datetime 
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def index(request):
    return HttpResponse('sell');

def all_list(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    sell_list = SellPost.objects.order_by('-date_published')
    paginator = Paginator(sell_list, 2)

    page = request.GET.get('page')

    try:
        sell_posts = paginator.page(page)   
    except PageNotAnInteger:
        # if page is not an integer, deliver the first page
        sell_posts = paginator.page(1)
    except EmptyPage:
        # if page is out of range, deliever the last page
        sell_posts = paginator.page(paginator.num_pages)

    return render_to_response('sell.html', {'sell_posts':sell_posts, 'user_id':wx_id })

def form(request):
    check_wx_id(request)
    wx_id = request.session['wx_id']
    #retrieve all the categories
    categories = Category.objects.all();
    return render_to_response('form.html',{'user_id':wx_id, 'categories':categories}); 

@csrf_exempt
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
        image1 = request.POST.get('image_name1','') 
        image2 = request.POST.get('image_name2','') 
        image3 = request.POST.get('image_name3','') 
        url = image1
        if image2:
            url = url+';'+image2
        if image3:
            url = url+';' + image3
        new_post.image_urls = url
        new_post.save()
        return HttpResponseRedirect('/history/')
    else:
        raise Http404