from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Notification,Privacy
from django.views.decorators.csrf import csrf_exempt

def index(request):
	#TO-DO: 
	if request.method == "GET":
		wx_id = request.GET.get('wx_id')
		if wx_id is None and request.session['wx_id'] is None:
			raise Http404
		elif wx_id is not None:
			request.session['wx_id'] = wx_id
		user = User.objects.get(wx_id=request.session['wx_id'])
		city = user.address.city 
        return render_to_response('index.html',{'user':user, 'city':city})

def check_wx_id(request):
	if request.session['wx_id'] is None or request.session['wx_id'] == '':
		raise Http404
