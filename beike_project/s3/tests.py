
from django.test import TestCase
from s3.views import get_exif


class ImageTest(TestCase):
    def test_get_exif(self):
        get_exif(None)
