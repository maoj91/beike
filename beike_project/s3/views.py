from __future__ import division
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseBadRequest
from data.models import AWS
from django.core.files.uploadedfile import UploadedFile
from beike_project import settings
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
import logging
import StringIO
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from data.image_util import ImageMetadata

LOGGER = logging.getLogger('s3.views')
S3_BUCKET = settings.S3_BUCKET

@csrf_exempt
def sign(request):
    AWS_ACCESS_KEY = AWS.objects.all()[0].access_key.encode('utf8')
    AWS_SECRET_KEY = AWS.objects.all()[0].access_secret.encode('utf8')
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
        format = img.format
        #resize the image
        resized_img = resize_image(img)
        imgMetadata = save_image_in_s3(resized_img, format, image_prefix)
        return HttpResponse(ImageMetadata.serialize(imgMetadata));
    else:
        return HttpResponseBadRequest("Invalid request.")

def resize_image(img):
    # Get the exif data
    exif_data = get_exif_data(img)

    # Rotate the image
    degree = get_image_rotation_degree(exif_data.get("Orientation", 1))
    rotated_img = img.rotate(degree)
    width, height = rotated_img.size

    # Resize the image but keep the height/width ratio
    resize_width = 300
    resize_height = 300
    if width > height:
        resize_height = int((height/width) * resize_width)
    else:
        resize_width = int((width/height) * resize_height)
    resized_img = rotated_img.resize((resize_width, resize_height))
    return resized_img

def save_image_in_s3(img, format, image_prefix):
    # Save to output
    output = StringIO.StringIO()
    img.save(output, format)
    # Save to S3
    AWS_ACCESS_KEY = AWS.objects.all()[0].access_key.encode('utf8')
    AWS_SECRET_KEY = AWS.objects.all()[0].access_secret.encode('utf8')
    conn = S3Connection(AWS_ACCESS_KEY, AWS_SECRET_KEY)
    bucket = conn.get_bucket(S3_BUCKET)
    k = Key(bucket)
    # Use timestamp to uniquely name the file
    k.key = image_prefix + "_" +str(int(time.time()))
    url = 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, k.key)
    k.set_contents_from_string(output.getvalue())
    k.set_acl('public-read')
    imgMetadata = ImageMetadata(url, img.size[0], img.size[1])
    return imgMetadata

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
        LOGGER.error('IOERROR')
    return ret

