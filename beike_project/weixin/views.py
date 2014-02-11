from django.http import HttpResponse
from django.template import RequestContext, Template
from django.views.decorators.csrf import csrf_exempt
from django.utils.encoding import smart_str, smart_unicode
from data.views import is_user_exist
from data.views import get_user
from data.views import is_user_has_email
from data.views import set_user_email
from data.models import User

import xml.etree.ElementTree as ET
import urllib,urllib2,time,hashlib

TOKEN = "weixin_beike_token"

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
	print rawStr
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
	msg = paraseMsgXml(ET.fromstring(rawStr))
	user_id = msg['FromUserName']
	content = msg.get('Content','content')
	url = ''
	if not is_user_exist(user_id):
<<<<<<< HEAD
		url='http://54.204.4.250/'+user_id+'/me/get_area/'
=======
		url='http://54.204.4.250/'+user_id+'/me/get_info/'
>>>>>>> c42416a795d90201da74ee1e803a3f50544fa537
	else:
		url = 'http://54.204.4.250/'+user_id
	return getReplyXml(msg,url)

def paraseMsgXml(rootElem):
	msg = {}
	if rootElem.tag == 'xml':
		for child in rootElem:
			msg[child.tag] = smart_str(child.text)
	return msg


<<<<<<< HEAD
def request_user_address(msg):
	fromUserName = msg['FromUserName']
	toUserName = msg['ToUserName']
	content = "We don't have your address info yet. Please choose your area: 1 for Seattle"
	extTpl ="<xml><ToUserName><![CDATA[%s]]></ToUserName><FromUserName><![CDATA[%s]]></FromUserName><CreateTime>%s</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[%s]]></Content></xml>"
	extTpl = extTpl % (fromUserName,toUserName,str(int(time.time())),content)
	return extTpl

def request_user_email(msg):
	fromUserName = msg['FromUserName']
	toUserName = msg['ToUserName']
	content = "We'd like to send notification to you when anyone replies to your post. Please type your email:"
	extTpl ="<xml><ToUserName><![CDATA[%s]]></ToUserName><FromUserName><![CDATA[%s]]></FromUserName><CreateTime>%s</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[%s]]></Content></xml>"
	extTpl = extTpl % (fromUserName,toUserName,str(int(time.time())),content)
	return extTpl

=======
>>>>>>> c42416a795d90201da74ee1e803a3f50544fa537
def getReplyXml(msg,url):
	extTpl ="<xml><ToUserName><![CDATA[%s]]></ToUserName><FromUserName><![CDATA[%s]]></FromUserName><CreateTime>%s</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>1</ArticleCount><Articles><item><Title><![CDATA[%s]]></Title><Description><![CDATA[%s]]></Description><PicUrl><![CDATA[%s]]></PicUrl><Url><![CDATA[%s]]></Url></item></Articles></xml>"

	fromUserName = msg['FromUserName']
	toUserName = msg['ToUserName']
	queryStr = msg.get('Content','You have input nothing~')
	title = "Welcome to beike!"
	description = "Click on this article to main page."
	picUrl = "https://s3-us-west-2.amazonaws.com/beike-s3/beike_main.jpg"
	extTpl = extTpl % (fromUserName,toUserName,str(int(time.time())),title,description,picUrl,url)
	return extTpl


<<<<<<< HEAD

=======
>>>>>>> c42416a795d90201da74ee1e803a3f50544fa537
