"""
Unit Test for sell app
"""

from django.test import TestCase
from data.image_util import ImageMetadata


class SellTest(TestCase):
    def test_image_util(self):
        md1 = ImageMetadata('www.amazon.com', 20, 10)
        result = ImageMetadata.serialize(md1)
        self.assertEqual('{"width": 20, "image_url": "www.amazon.com", "height": 10}', result)
        md2 = ImageMetadata.deserialize(result)
        self.assertEqual(md2.image_url, "www.amazon.com")
        self.assertEqual(md2.width, 20)
        self.assertEqual(md2.height, 10)

        md1 = ImageMetadata('www.amazon.com', 20, 10)
        md2 = ImageMetadata('www.cmu.com', 30, 20)
        md_list1 = [md1, md2]
        list_str = ImageMetadata.serialize_list(md_list1)
        

        md_list2 = ImageMetadata.deserialize_list(list_str)
        self.assertEqual(2, len(md_list2))
        self.assertEqual(md1.image_url, md_list2[0].image_url)
        self.assertEqual(md1.width, md_list2[0].width)
        self.assertEqual(md1.height, md_list2[0].height)