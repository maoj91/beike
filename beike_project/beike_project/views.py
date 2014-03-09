from django.http import Http404,HttpResponse
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from data.models import User,State,City,Notification,Privacy
from django.views.decorators.csrf import csrf_exempt

def index(request, userid):
    user = User.objects.get(wx_id=userid)
    city = user.address.city 
    return render_to_response('index.html',{'user':user, 'city':city})