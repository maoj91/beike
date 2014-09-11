
from django.test import TestCase
from PIL import Image
from s3.views import resize_image, get_exif_data


class ImageTest(TestCase):
    def test_imgage_resize(self):
    	f = open('s3/test_img.png')
        img = Image.open(f)
        self.assertEqual(349, img.size[0])
        self.assertEqual(177, img.size[1])
        img2 = resize_image(img)
        self.assertEqual(300, img2.size[0])
        self.assertEqual(152, img2.size[1])
        self.assertEqual(img.size[0]/img.size[1], img2.size[0]/img2.size[1])
        
