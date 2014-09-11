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
WEIXIN_PIC_URL = 'https://s3-us-west-2.amazonaws.com/beike-s3/beike_main.jpg'

# Request to view all the sell posts with pagination
# It return at maximum NUM_SELL_POST_PER_PAGE per response.
NUM_SELL_POST_PER_PAGE = 20
# Request to view all the buy posts with pagination
# It return at maximum NUM_BUY_POST_PER_PAGE per response.
NUM_BUY_POST_PER_PAGE = 20
