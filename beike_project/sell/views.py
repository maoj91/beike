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


def sign_s3(request,user_id):
    AWS_ACCESS_KEY = 'AKIAIHSXDEZMJ2N7VJWQ'
    AWS_SECRET_KEY = '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'
    S3_BUCKET = 'beike-s3'

    object_name = request.GET.get('s3_object_name')
    mime_type = request.GET.get('s3_object_type')

    expires = int(time.time()+10)
    amz_headers = "x-amz-acl:public-read"

    put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, object_name)

    signature = base64.encodestring(hmac.new(AWS_SECRET_KEY,put_request, sha).digest())
    signature = urllib.quote_plus(signature.strip())

    url = 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, object_name)

    return json.dumps({
        'signed_request': '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),
         'url': url
      })

