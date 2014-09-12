# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import RequestContext, Template
from django.views.decorators.csrf import csrf_exempt
from django.utils.encoding import smart_str, smart_unicode
from data.views import is_user_exist
from data.views import get_user
from data.views import is_user_has_email
from data.views import set_user_email
from data.utils import getValidationKey
from data.models import User, UserValidation
from beike_project import settings
import logging

import xml.etree.ElementTree as ET
import urllib,urllib2,time,hashlib

LOGGER = logging.getLogger("weixin.views")
TOKEN = "weixin_beike_token"
SERVER_URL = settings.SERVER_URL
WEIXIN_PIC_URL = settings.WEIXIN_PIC_URL

@csrf_exempt
def valid(request):
	if request.method == 'GET':
		response = HttpResponse(checkSignature(request),content_type="text/plain")
		return response
	elif request.method == 'POST':
		response = HttpResponse(responseMsg(request),content_type="application/xml")
		return response
	else:
		return None

def checkSignature(request):
	global TOKEN
	rawStr = smart_str(request.body)
	LOGGER.info(rawStr)
	signature = request.GET.get("signature", None)
	timestamp = request.GET.get("timestamp", None)
	nonce = request.GET.get("nonce", None)
	echoStr = request.GET.get("echostr",None)

	token = TOKEN
	tmpList = [token,timestamp,nonce]
	tmpList.sort()
	tmpstr = "%s%s%s" % tuple(tmpList)
	tmpstr = hashlib.sha1(tmpstr).hexdigest()
	if tmpstr == signature:
		return echoStr
	else:
		return None

def responseMsg(request):
	rawStr = smart_str(request.body)
	msg = parse_input_msg(ET.fromstring(rawStr))
	msgType  = msg['MsgType']
	user_id = msg['FromUserName']
	content = msg.get('Content','content')
	validation_key = getValidationKey(user_id)
	print msgType 
	if msgType == 'event':
		eventType  = msg['Event']
		if eventType == 'unsubscribe':
			LOGGER.info(msg)
		if eventType == 'subscribe':
			url = SERVER_URL + '/?wx_id=' + user_id + '&key=' + validation_key
			LOGGER.info("Response URL: " + url)
			return create_template(msg,url)
	if msgType == 'text':		
		url = SERVER_URL + '/?wx_id=' + user_id + '&key=' + validation_key
		LOGGER.info("Response URL: " + url)
		return create_template(msg,url)

def parse_input_msg(rootElem):
	msg = {}
	if rootElem.tag == 'xml':
		for child in rootElem:
			msg[child.tag] = smart_str(child.text)
	return msg

def create_template(msg,url):
	extTpl ="<xml><ToUserName><![CDATA[%s]]></ToUserName><FromUserName><![CDATA[%s]]></FromUserName><CreateTime>%s</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>1</ArticleCount><Articles><item><Title><![CDATA[%s]]></Title><Description><![CDATA[%s]]></Description><PicUrl><![CDATA[%s]]></PicUrl><Url><![CDATA[%s]]></Url></item></Articles></xml>"
	fromUserName = msg['FromUserName']
	toUserName = msg['ToUserName']
	title = unicode('欢迎来到千贝', 'utf-8')
	description = unicode('请点击该页面进入千贝易物平台', 'utf-8')
	extTpl = extTpl % (fromUserName,toUserName,str(int(time.time())),title,description,WEIXIN_PIC_URL,url)
	return extTpl
