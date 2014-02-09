from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from data.models import Post
from data.models import User
from sell.forms import SellTextForm
from data.views import get_user
from django.forms.formsets import formset_factory
import datetime

def index(request):
	return HttpResponse('sell');

def all_list(request,user_id):
	sell_list = Post.objects.filter(is_buy=False).order_by('-date_published')
	return render_to_response('sell.html', {'sell_list':sell_list,'user_id':user_id })

def form(request,user_id):
	text_form = SellTextForm()
	return render_to_response('form.html',{'text_form': text_form,'user_id':user_id}); 

@csrf_exempt
def form_submit(request,user_id):
    errors = []
    if request.method == 'POST':
	#text_form = SellTextForm(request.POST)
	is_text_form_valid = False
	is_image_form_valid = False
	new_post = Post()
	new_post.is_buy = False
	new_post.date_published = datetime.datetime.now()
	new_post.user = get_user(user_id)

        if text_form.is_valid():
		is_text_form_valid = True
		cd = text_form.cleaned_data
		title = cd.get('title','')
		content = cd.get('content','')
		category = cd.get('category','')
		price = cd.get('price','')
		new_post.image_urls = request.POST.get('image_names','') 
		new_post.title = title
		new_post.price_num = price
		new_post.category = category
		new_post.content = content

	if is_text_form_valid:
		new_post.save()
	return HttpResponseRedirect('/'+user_id+'/history/')

