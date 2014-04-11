from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Notification,Privacy
from django.views.decorators.csrf import csrf_exempt
from data.views import is_user_exist

def index(request):
	#TO-DO: 
	if request.method == "GET":
		wx_id = request.GET.get('wx_id')
		if wx_id is None:
			 wx_id = request.session['wx_id']
		if wx_id is None:
			raise Http404
		else:
			request.session['wx_id'] = wx_id
			if not is_user_exist(wx_id):
				return HttpResponseRedirect('/me/get_info/')
			else:
				user = User.objects.get(wx_id=request.session['wx_id'])
				city = user.address.city 
		        return render_to_response('index.html',{'user':user, 'city':city})

def check_wx_id(request):
	if request.session['wx_id'] is None or request.session['wx_id'] == '':
		raise Http404
