from django.test import TestCase
from geolocation import get_location, get_city, Geolocation
import json

class GeolocationTest(TestCase):
    # def test_reverse_geocoding(self):
    # 	result = get_location( 39.9100, 116)
    # 	print result

    def test_get_city_by_zipcode(self):
        result = get_city('98117')
        print result

    def test_construct_geolocation(self):
    	location = Geolocation(47, -122, 535, 'Terry Ave N', 'South Lake Union', None, 'Seattle', 'Washington', 'United States', '98109')
    	self.assertEqual(location.latitude, 47)
    	self.assertEqual(location.longitude, -122)
    	self.assertEqual(location.street_name, 'Terry Ave N')
    	self.assertEqual(location.lv1_district, 'South Lake Union')
    	self.assertEqual(location.city, 'Seattle')
    	self.assertEqual(location.state, 'Washington')
    	self.assertEqual(location.zipcode, '98109')
