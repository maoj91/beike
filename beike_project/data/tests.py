from django.test import TestCase
from data.models import *
from data.views import get_category, get_condition
from django.contrib.gis.geos import Point
import datetime
from decimal import *

"""
Model objects populator
"""
class DataModelBootstrap:
    def __init__(self):
        pass

    def boot(self):
        #create basic objects
        book_category = Category.objects.create(name="Book")
        furniture_category = Category.objects.create(name="Furniture")
        email_noti = Notification.objects.create(name="email")
        phone_noti = Notification.objects.create(name="phone")
        public = Privacy.objects.create(name="public")
        private = Privacy.objects.create(name="private")
        new_condition = Condition.objects.create(name = "New")
        old_condition = Condition.objects.create(name = "Old")

        
        #create location objects
        china = Country.objects.create(name = "China", currency_code = "CNY")
        guangdong = State.objects.create(name = "Guangdong", country = china)
        jieyang = City.objects.create(name = "Jieyang", state = guangdong, country = china)
        rongcheng = District.objects.create(name = "Rongcheng", city = jieyang,
            first_level_district = None, zip_code = "522000")

        #create address
        user_address = Address.objects.create(street_line_1 = "No 502 Xinxinnan Road",
            street_line_2 = None, city = jieyang, latlon=Point(116.35, 23.55))

        #create user
        my_user = User.objects.create(name="Leon", gender=0, wx_id="test1234",
            qq_number=None, mobile_phone=None,
            home_phone=None, email="test1234@gmail.com",
            address=user_address, notification=email_noti, privacy=private,
            image_url=None)

        #create buy post1
        buy_post = BuyPost.objects.create(title = "Math2",date_published = datetime.datetime.now(),
            open_until = None, content = "Bang", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(-122.33, 47.61), 
            user = my_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)

        #create sell post
        sell_post = SellPost.objects.create(title = "Sofa", date_published = datetime.datetime.now(),
            open_until = None, content = "big", category = furniture_category, item_condition = old_condition, 
            price = 999.99, zipcode = None, location_type = 1, latlon = Point(-122.33, 50.9), user = my_user,
            preferred_contacts = "phone", is_open = False, image_urls = "http://abc/abc.jpg")

"""
Category model test cases
"""
class CategoryTest(TestCase):
    def setUp(self):
        DataModelBootstrap().boot()

    def test_get_category(self):
        c1 = Category.objects.get(name="Book")
        c2 = Category.objects.get(name="Furniture")
        self.assertEqual(c1.name, "Book")
        self.assertEqual(c2.name, "Furniture")

    def test_category_not_exist(self):
        with self.assertRaises(Exception):
            Category.objects.get(name="Shit")

"""
Condition model test cases
"""
class ConditionTest(TestCase):
    def setUp(self):
        DataModelBootstrap().boot()

    def test_get_condition(self):
        conditions = Condition.objects.all()
        self.assertEqual(2, conditions.count())

"""
BuyPost model test cases
"""
class BuyPostTest(TestCase):
    def setUp(self):
        DataModelBootstrap().boot()
    def test_buy_post(self):
        buy_post = BuyPost.objects.get(title="Math2")
        self.assertEqual(-122.33, buy_post.latlon.coords[0])
        self.assertEqual(47.61, buy_post.latlon.coords[1])

"""
SellPost model test case
"""
class SellPostTest(TestCase):
    def setUp(self):
        DataModelBootstrap().boot()
    def test_sell_post(self):
        sell_post = SellPost.objects.get(title = "Sofa")
