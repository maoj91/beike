from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Privacy,UserValidation
from data.views import is_user_exist

def index(request):
	#TO-DO: 
	if request.method == "GET":
		wx_id = request.GET.get('wx_id')
		key = request.GET.get('key')
		if wx_id is None:
			 wx_id = request.session['wx_id']
		if key is None:
			 key = request.session['key']		
		if wx_id is None or key is None:
			raise Http404
		else:
			request.session['wx_id'] = wx_id
			request.session['key'] = key
			validate_user(request)
			if not is_user_exist(wx_id):
				return HttpResponseRedirect('/me/get_info/')
			else:
				user = User.objects.get(wx_id=request.session['wx_id'])
				city = user.address.city 
		        return render_to_response('index.html',{'user':user, 'city':city})

def healthcheck(request):
	return render_to_response('health_check.html')

def validate_user(request):
	wx_id = request.session['wx_id']
	key = request.session['key']
	if wx_id is None or wx_id  == '':
		raise Http404
	if key is None or key == '':
		raise Http404
	if UserValidation.objects.filter(user_id=wx_id).exists():
		stored_key = UserValidation.objects.get(user_id=wx_id)
		if key!=stored_key.key:
			raise Http404
	else:
		raise Http404
