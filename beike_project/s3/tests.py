
from django.test import TestCase
from PIL import Image
from s3.views import resize_image, get_exif_data
import pygame


class ImageTest(TestCase):
     
    def test_pygame_resize(self):
        img = pygame.image.load('s3/tibet.jpg')
        img = resize_image(img,300, 0)
        pygame.image.save(img, 's3/pygame_image.jpg')
