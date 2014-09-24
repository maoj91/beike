from django.test import TestCase
from geolocation import Geolocation, get_geolocation_by_zipcode
from session_util import is_request_valid, get_wx_id
import json
from django.test import Client
from data.models import Country, State, City, UserValidation
from django.http import HttpRequest

class GeolocationTest(TestCase):

    def test_construct_geolocation(self):
        location = Geolocation(47, -122, 535, 'Terry Ave N', 'South Lake Union', None, 'Seattle', 'Washington', 'United States', '98109')
        self.assertEqual(location.latitude, 47)
        self.assertEqual(location.longitude, -122)
        self.assertEqual(location.street_name, 'Terry Ave N')
        self.assertEqual(location.lv1_district, 'South Lake Union')
        self.assertEqual(location.city, 'Seattle')
        self.assertEqual(location.state, 'Washington')
        self.assertEqual(location.zipcode, '98109')

        locationJson = location.to_json();
        self.assertEqual(locationJson['latitude'], 47)
        self.assertEqual(locationJson['longitude'], -122)
        self.assertEqual(locationJson['street_name'], 'Terry Ave N')
        self.assertEqual(locationJson['lv1_district'], 'South Lake Union')
        self.assertEqual(locationJson['city'], 'Seattle')
        self.assertEqual(locationJson['state'], 'Washington')
        self.assertEqual(locationJson['zipcode'], '98109')

    def test_get_geolocation_by_zipcode(self):
        geolocation = get_geolocation_by_zipcode('98117')
        self.assertEqual(geolocation.city, 'Seattle')
        self.assertEqual(geolocation.state, 'Washington')

class UserViewTest(TestCase):
    def setUp(self):
        Country.objects.create(name = 'China', currency_code = 'CNY')
        Country.objects.create(name = 'United States', currency_code = 'USD')

    def test_get_and_create_location_by_latlong(self):
        stateSet = State.objects.filter(name = 'Guangdong')
        self.assertFalse(stateSet.exists())
        citySet = City.objects.filter(name='Jieyang')
        self.assertFalse(citySet.exists())
        c = Client()
        response = c.get('/user/get_info/get_city_by_latlong', {'latitude': 23, 'longitude': 116},
                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print response
        state = State.objects.get(name = 'Guangdong')
        self.assertEqual(state.name, 'Guangdong')
        city = City.objects.get(name = 'Jieyang')
        self.assertEqual(city.name, 'Jieyang')

    def test_get_and_create_location_by_zipcode(self):
        stateSet = State.objects.filter(name = 'Washington')
        self.assertFalse(stateSet.exists())
        citySet = City.objects.filter(name='Seattle')
        self.assertFalse(citySet.exists())
        c = Client()
        response = c.get('/user/get_info/get_city_by_zipcode', {'zipcode': '98117'},
                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print response
        state = State.objects.get(name = 'Washington')
        self.assertEqual(state.name, 'Washington')
        city = City.objects.get(name = 'Seattle')
        self.assertEqual(city.name, 'Seattle')

class SessionUtilTest(TestCase):
    def setUp(self):
        UserValidation.objects.create(user_id = 'user1234', key = 'key1234')

    def test_request_validation(self):
        request = HttpRequest()
        request.method = 'GET'
        request.GET = {}
        request.session = {}
        result1 = is_request_valid(request)
        self.assertFalse(result1)
        request.GET['wx_id'] = 'user1234'
        request.GET['key'] = 'key1234'
        result2 = is_request_valid(request)
        self.assertTrue(result2)
        self.assertEqual('user1234', request.session.get('wx_id'))
        self.assertEqual('key1234', request.session.get('key'))

    def test_get_wxid(self):
        request = HttpRequest()
        request.method = 'GET'
        request.GET = {}
        request.session = {}
        wx_id = get_wx_id(request)
        self.assertEqual(None, wx_id)

        request.session['wx_id'] = 'user123'
        wx_id = get_wx_id(request)
        self.assertEqual('user123', wx_id)

        request.GET['wx_id'] = 'user1234'
        request.method = "GET"
        wx_id = get_wx_id(request)
        self.assertEqual('user1234', wx_id)






