
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'beike_db',
        # The following settings are not used with sqlite3:
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}

SERVER_URL = 'http://54.204.4.250'
S3_BUCKET = 'beike-s3'

# Request to view all the sell posts with pagination
# It return at maximum NUM_SELL_POST_PER_PAGE per response.
NUM_SELL_POST_PER_PAGE = 10
# Request to view all the buy posts with pagination
# It return at maximum NUM_BUY_POST_PER_PAGE per response.
NUM_BUY_POST_PER_PAGE = 10