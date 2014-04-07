from pygeocoder import Geocoder
import json

def get_location_by_latlong(latitude, longitude):
    # call google geolocation service to get the location detail
    results = Geocoder.reverse_geocode(latitude, longitude)
    if results is not None and len(results) > 0:
        google_location = results.raw[0]

        location = Geolocation()
        location.latitude = google_location['geometry']['location']['lat']
        location.longitude = google_location['geometry']['location']['lng']
        address_components = google_location['address_components']
        for component in address_components:
            if 'street_number' in component['types']:
                location.street_num = component['long_name']
            if 'route' in component['types']:
                location.street_name = component['long_name']
            if 'neighborhood' in component['types']:
                location.lv1_district = component['long_name']
            if 'locality' in component['types']:
                location.city = component['long_name']
            if 'administrative_area_level_1' in component['types']:
                location.state = component['long_name']
            if 'country' in component['types']:
                location.country = component['long_name']
            if 'postal_code' in component['types']:
                location.zipcode = component['long_name']
        return location
    else:
        return None

def get_zipcode_by_latlong(latitude, longitude):
    results = Geocoder.reverse_geocode(latitude, longitude)
    if results is not None and len(results) > 0:
        google_location = results.raw[0]
        address_components = google_location['address_components']
        for component in address_components:
            if 'postal_code' in component['types']:
                return component['long_name']
    return None

def get_location_by_zipcode(zipcode):
    results = Geocoder.geocode(zipcode)
    if results is not None and len(results) > 0:
        google_location = results.raw[0]
        print google_location
        location = Geolocation()
        address_components = google_location['address_components']
        for component in address_components:
            if 'neighborhood' in component['types']:
                location.lv1_district = component['long_name']
            if 'locality' in component['types']:
                location.city = component['long_name']
            if 'administrative_area_level_1' in component['types']:
                location.state = component['long_name']
            if 'country' in component['types']:
                location.country = component['long_name']
            if 'postal_code' in component['types']:
                location.zipcode = component['long_name']
        return location

class Geolocation(object):

    def __init__(self):
        pass

    def __init__(self, latitude = None, longitude=None, street_num=None,
        street_name=None, lv1_district=None, lv2_district=None,
        city=None, state=None, country=None, zipcode=None):
        self._latitude = latitude
        self._longitude = longitude
        self._street_num = street_num
        self._street_name = street_name
        self._lv1_district = lv1_district
        self._lv2_district = lv2_district
        self._city = city
        self._state = state
        self._country = country
        self._zipcode = zipcode

    def __str__(self):
        return """latitude: {}, longitude: {}, street_num: {}, street_name: {}, lv1_district: {}, lv2_district: {}, city: {}, state: {}, country: {}, zipcode: {}""".format(
            self.latitude, self.longitude, self.street_num, self.street_name,
            self.lv1_district, self.lv2_district, self.city, self.state, self.country, self.zipcode)

    @property
    def latitude(self):
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        self._latitude = value

    @property
    def longitude(self):
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        self._longitude = value

    @property
    def street_num(self):
        return self._street_num

    @street_num.setter
    def street_num(self, value):
        self._street_num = value

    @property
    def street_name(self):
        return self._street_name

    @street_name.setter
    def street_name(self, value):
        self._street_name = value

    @property
    def lv1_district(self):
        return self._lv1_district

    @lv1_district.setter
    def lv1_district(self, value):
        self._lv1_district = value

    @property
    def lv2_district(self):
        return self._lv2_district

    @lv2_district.setter
    def lv2_district(self, value):
        self._lv2_district = value

    @property
    def city(self):
        return self._city

    @city.setter
    def city(self, value):
        self._city = value

    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, value):
        self._state = value

    @property
    def country(self):
        return self._country

    @country.setter
    def country(self, value):
        self._country = value

    @property
    def zipcode(self):
        return self._zipcode

    @zipcode.setter
    def zipcode(self, value):
        self._zipcode = value
