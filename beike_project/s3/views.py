from django.views.decorators.csrf import csrf_exempt
from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
import time
import base64
import hmac
import hashlib
import urllib
import json
import os

@csrf_exempt
def sign(request):
	AWS_ACCESS_KEY = 'AKIAJNL7REYQW5STAZPQ'#os.environ["AWS_ACCESS_KEY"]
	AWS_SECRET_KEY = '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'#os.environ["AWS_SECRET_KEY"]
	S3_BUCKET = 'beike-s3'


	object_name = request.GET.get('s3_object_name')
	mime_type = request.GET.get('s3_object_type')

	expires = int(time.time()+60)
	amz_headers = "x-amz-acl:public-read"

	put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, object_name)

	signature = base64.encodestring(hmac.new(AWS_SECRET_KEY,put_request, hashlib.sha1).digest())
	signature = urllib.quote_plus(signature.strip())

	url = 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, object_name)

	return HttpResponse(json.dumps({
				'signed_request': '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),
				'url': url
				}),'application/json')
