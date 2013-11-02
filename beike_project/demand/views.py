# -*-coding:utf-8 -*-

from django.http import HttpResponse


def index(request):
    return HttpResponse("我是房客 demand")
