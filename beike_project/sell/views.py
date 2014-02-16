from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from data.models import Post,User,Category
from data.views import get_user
from django.forms.formsets import formset_factory
import datetime

def index(request):
	return HttpResponse('sell');

def all_list(request,user_id):
	sell_list = Post.objects.filter(is_buy=False).order_by('-date_published')
	return render_to_response('sell.html', {'sell_list':sell_list,'user_id':user_id })

def form(request,user_id):
	error = ''
	return render_to_response('form.html',{'user_id':user_id,'error':error}); 

@csrf_exempt
def form_submit(request,user_id):
	error = ''
	if request.method == 'POST':
		new_post = Post()
		new_post.is_buy = False
		new_post.date_published = datetime.datetime.now()
		new_post.user = get_user(user_id)

		#get image urls 
		title = request.POST.get('title','')
		content = request.POST.get('content','')
		#category = request.POST.get('category','')
		price = request.POST.get('price','')
		image1 = request.POST.get('image_name1','') 
		image2 = request.POST.get('image_name2','') 
		image3 = request.POST.get('image_name3','') 
		my_condition = request.POST.get('my_condition',1) 
		#TODO:need to validate phone number
		phone = request.POST.get('phone','')
		if not(title and price and content):
			error = "Please check your input"
			return render_to_response('form.html',{'user_id':user_id,'error':error}); 
		elif not (image1 or image2 or image3):
			error = "Please upload at least one image" 
			return render_to_response('form.html',{'user_id':user_id,'error':error}); 
		else:
			url = image1
			if image2:
				url = url+';'+image2
			if image3:
				url = url+';' + image3
			new_post.image_urls = url
			new_post.title = title
			new_post.item_condition = my_condition
			new_post.price_num = price
			new_post.phone = phone
			new_post.category = Category.objects.all()[0]
			new_post.content = content
			new_post.save()
			return HttpResponseRedirect('/'+user_id+'/history/')
	else:
		raise Http404

