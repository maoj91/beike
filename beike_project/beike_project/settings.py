# Django settings for beike_project project.
import os,sys

DOMAIN = os.environ.get('DOMAIN', 'TEST')
print "DOMAIN: " + DOMAIN
if DOMAIN == 'TEST':
    from devo_settings import *
elif DOMAIN == 'PROD':
    from prod_settings import *
else:
    raise Exception("Invalid domain value: " + DOMAIN)

DEBUG = True
TEMPLATE_DEBUG = DEBUG
POSTGIS_VERSION = ( 2, 1 )

BASE_DIR = '' 

ADMINS = (
    ('Qianbei', 'qianbei.platform@gmail.com'),
)

MANAGERS = ADMINS

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = []

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = ''

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

MEDIA_URL = '/media/'

# Static assets directory to serve in production
STATIC_ROOT = "/var/www/beike/static/"
# All the files in installed_app/static/ directory will be copied to STATIC_ROOT
STATIC_URL = '/static/'
# All the files in beike_project/static/ will be copied to STATIC_ROOT
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static"),
)

AWS_STORAGE_BUCKET_NAME = 'beike-s3' #os.environ['AWS_STORAGE_BUCKET_NAME']
#STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
#S3_URL = 'http://%s.s3.amazonaws.com/' % AWS_STORAGE_BUCKET_NAME
#STATIC_URL = S3_URL

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'b)p*(4ve%w#j-+t7=l7gs06=&@302wpn&8)6oul*b1fuzk_^c='

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'beike_project.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'beike_project.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
	os.path.join(BASE_DIR, 'templates'),
        "/home/ubuntu/beike_repo/beike_project/templates", #devo
        "/home/ubuntu/beike/beike_project/templates", #prod
)

INSTALLED_APPS = (
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.sites',
	'django.contrib.messages',
	'django.contrib.staticfiles',
        'django.contrib.gis',
        'mathfilters',
	'django.contrib.admin',
	# Uncomment the next line to enable admin documentation:
	# 'django.contrib.admindocs',
	'sell',
	'buy',
	'mine',
	'detail',
	'data',
	's3',
	'user',  
    'about',
)

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
        'console':{
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'

        },

    },
    'loggers': {
        'django': {
            'handlers': ['console'],      
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'detail': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'sell': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'buy': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        }
    }

}

if 'test' in sys.argv:
    try:
        from test_settings import *
    except ImportError:
        pass

