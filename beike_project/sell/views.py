from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from data.models import Post
from data.models import User
from sell.forms import SellTextForm
from sell.forms import SellImageForm
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
	ImageFormSet = formset_factory(SellImageForm)	
	set_config = {
		'form-TOTAL_FORMS': u'1',
		'form-INITIAL_FORMS': u'1',
		'form-MAX_NUM_FORMS': u'3',
	}
	image_form_set = ImageFormSet(set_config)
	return render_to_response('form.html',{'text_form': text_form,'image_form_set':image_form_set,'user_id':user_id}); 

@csrf_exempt
def form_submit(request,user_id):
#    c = {}
#    c.update(csrf(request))
    errors = []
    if request.method == 'POST':
	ImageFormSet = formset_factory(SellImageForm)	
	text_form = SellTextForm(request.POST)
	image_form_set = ImageFormSet(request.POST, request.FILES)
	is_text_form_valid = False
	is_image_form_valid = False
	new_post = Post()
	new_post.is_buy = False
	new_post.date_published = datetime.datetime.now()
	new_post.user = get_user(user_id)
	base_url = 'http://54.204.4.250/static/img/'
	image_urls = ''

        if text_form.is_valid():
		is_text_form_valid = True
		cd = text_form.cleaned_data
		title = cd['title']
		content = cd['content']
		category = cd['category']
		price = cd['price']
		new_post.title = title
		new_post.price_num = price
		new_post.category = category
		new_post.content = content
		new_post.save()
	if image_form_set.is_valid():
		print image_form_set
		is_image_form_valid = True
		i = 0 
		for image_form in image_form_set:
			print 'i is ' + str(i)
			image = request.FILES['form-'+str(i)+'-image']
			i+=1
			set_image_name(image,new_post.id,i)
			handle_uploaded_image(image)
			if image_urls is '':
				image_urls = base_url+image.name
			else: 
				image_urls += ';'+base_url+image.name
		

	new_post.image_urls = image_urls
	if is_text_form_valid and is_image_form_valid:
		new_post.save()
	return HttpResponseRedirect('/'+user_id+'/history/')
    #return render(request, 'form.html',
    #    {'errors': errors})

def handle_uploaded_image(f):
    with open('/home/ubuntu/beike_repo/beike_project/static/img/'+f.name, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

def set_image_name(image,post_id,index):
	#time = datetime.datetime.now()
	#image.name = time.strftime('%Y%m%d%H%M%S')+'.jpg'
	image.name = str(post_id)+'-'+str(index)+'.jpg'


