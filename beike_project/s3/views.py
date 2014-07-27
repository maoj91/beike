from __future__ import division
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseBadRequest
from data.models import AWS
from django.core.files.uploadedfile import UploadedFile
from PIL import Image
from PIL.ExifTags import TAGS
import time
import base64
import hmac
import hashlib
import urllib
import json
import os
import json
import time
import StringIO
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from data.image_util import ImageMetadata

@csrf_exempt
def sign(request):
    AWS_ACCESS_KEY = AWS.objects.all()[0].access_key.encode('utf8')
    AWS_SECRET_KEY = AWS.objects.all()[0].access_secret.encode('utf8')
    S3_BUCKET = 'beike-s3'
    object_name = request.GET.get('s3_object_name')
    mime_type = request.GET.get('s3_object_type')
    expires = int(time.time() + 10000)
    amz_headers = "x-amz-acl:public-read"

    put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, object_name)

    signature = base64.encodestring(hmac.new(AWS_SECRET_KEY,put_request, hashlib.sha1).digest())
    signature = urllib.quote_plus(signature.strip())

    url = 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, object_name)

    return HttpResponse(json.dumps({
                'signed_request': '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),
                'url': url
                }),'application/json')

@csrf_exempt
def upload(request):
    if request.method == "POST":
        image_prefix = request.session['wx_id']
        if request.FILES == None:
            return HttpResponseBadRequest("Must have file attached.")
        # Open the file
        file = request.FILES['post_image']
        img = Image.open(file)

        # Get the exif data
        format = img.format
        exif_data = get_exif_data(img)

        # Rotate the image
        degree = get_image_rotation_degree(exif_data.get("Orientation", 1))
        rotated_img = img.rotate(degree)
        width, height = rotated_img.size
        resize_width = 600
        resize_height = 600
        if width > height:
            resize_height = int((height/width) * resize_width)
        else:
            resize_width = int((width/height) * resize_height)
        resize_img = rotated_img.resize((resize_width, resize_height))
        output = StringIO.StringIO()
        resize_img.save(output, format)

        # Save to S3
        AWS_ACCESS_KEY = AWS.objects.all()[0].access_key.encode('utf8')
        AWS_SECRET_KEY = AWS.objects.all()[0].access_secret.encode('utf8')
        S3_BUCKET = 'beike-s3'
        conn = S3Connection(AWS_ACCESS_KEY, AWS_SECRET_KEY)
        bucket = conn.get_bucket(S3_BUCKET)
        k = Key(bucket)
        k.key = image_prefix + "_" +str(int(time.time()))
        url = 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, k.key)
        k.set_contents_from_string(output.getvalue())
        k.set_acl('public-read')

        imgMetadata = ImageMetadata(url, resize_width, resize_height, 1)
        return HttpResponse(ImageMetadata.serialize(imgMetadata));
    else:
        return HttpResponseBadRequest("Invalid request.")

def get_image_rotation_degree(orientation):
    if orientation == 3:
        return 180
    elif orientation == 6:
        return -90
    elif orientation == 8:
        return 90
    else:
        return 0

def get_exif_data(image):
    ret = {}
    try:
        if hasattr(image, '_getexif'):
            exif_info = image._getexif()
            if exif_info != None:
                for tag, value in exif_info.items():
                    decoded = TAGS.get(tag, tag)
                    ret[decoded] = value
    except IOError:
        print 'IOERROR'
    return ret




