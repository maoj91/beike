from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import Post
from data.models import User
from buy.forms import BuyForm
from data.views import get_user
import datetime

def all_list(request,user_id):
	buy_list = Post.objects.filter(is_buy=True).order_by('-date_published')
	return render_to_response('buy.html', {'buy_list':buy_list,'user_id':user_id })



def form(request,user_id):
	form = BuyForm()
	return render_to_response('buy_form.html',{'form': form,'user_id':user_id}); 

@csrf_exempt
def form_submit(request,user_id):
#    c = {}
#    c.update(csrf(request))
    errors = []
    if request.method == 'POST':
	form = BuyForm(request.POST)
        if form.is_valid():
		cd = form.cleaned_data
		title = cd['title']
		content = cd['content']
		category = cd['category']
		price = cd['price']
	new_post = Post()
	new_post.id = None
	new_post.is_buy = True
	new_post.date_published = datetime.datetime.now()
	new_post.price_num = price
	new_post.user = get_user(user_id)
	new_post.title = title
	new_post.category = category
	new_post.content = content
	new_post.save()
	return HttpResponseRedirect('/'+user_id+'/history/')
    #return render(request, 'form.html',
    #    {'errors': errors})


