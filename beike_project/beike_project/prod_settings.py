DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis', 
        'NAME': 'qianbei',
        'USER': 'qianbei_dev',
        'PASSWORD': 'beike2014',
        'HOST': 'beike.cpgxhuvpyh7y.us-west-2.rds.amazonaws.com',
        'PORT': '5432',
    }
}

SERVER_URL = 'http://beike-lb-1803186124.us-west-2.elb.amazonaws.com'
S3_BUCKET = 'beike-s3-prod'

