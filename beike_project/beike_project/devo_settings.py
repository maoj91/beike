
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