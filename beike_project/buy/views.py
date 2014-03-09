from django.http import Http404,HttpResponse
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from data.models import Post,User,Category
from data.views import get_user
from datetime import datetime

def all_list(request,user_id):
	buy_list = Post.objects.filter(is_buy=True).order_by('-date_published')
	return render_to_response('buy.html', {'buy_list':buy_list,'user_id':user_id })



def form(request,user_id):
	return render_to_response('buy_form.html',{'user_id':user_id}); 

@csrf_exempt
def form_submit(request,user_id):
#    c = {}
#    c.update(csrf(request))
	if request.method == 'POST':
		title = request.POST.get('title','')
		content = request.POST.get('content','')
		#category = request.POST.get('category','')
		min_price = request.POST.get('min_price','')
		max_price = request.POST.get('max_price','')
		phone = request.POST.get('phone','')
		open_until = request.POST.get('open_until_date','')
		new_post = Post()
		new_post.id = None
		new_post.is_buy = True
		new_post.date_published = datetime.now()
		new_post.ask_price_min = min_price
		new_post.ask_price_max = max_price
		new_post.open_until = datetime.strptime(open_until,'%Y-%m-%d')
		new_post.phone = phone
		new_post.user = get_user(user_id)
		new_post.title = title
		new_post.category = Category.objects.all()[0]
		#new_post.category = category
		new_post.content = content
		new_post.save()
		return HttpResponseRedirect('/'+user_id+'/history/')
	else: 
		raise Http404

