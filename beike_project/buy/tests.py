"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from data.models import User, BuyPost, Notification, Privacy, Category
from data.tests import DataModelBootstrap
from buy.buy_post_util import BuyPostUtil
import datetime
from django.contrib.gis.geos import Point
from django.db import connection

class BuyBootstrap:
    def __init__(self):
        pass
    def boot(self):
        DataModelBootstrap().boot()
        email_noti = Notification.objects.get(name="email")
        pubicPermission = Privacy.objects.get(name="public")
        book_category = Category.objects.get(name="Book")
        other_user = User.objects.create(name="Other", gender=0, wx_id="test1000",
            qq_number=None, mobile_phone=None,
            home_phone=None, email="test1000@gmail.com",
            address=None, notification=email_noti, privacy=pubicPermission,
            image_url=None)
        tokyo_post = BuyPost.objects.create(title = "Tokyo book",date_published = datetime.datetime.now(),
            open_until = None, content = "Tokyo book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(139.6917, 35.6895), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)
        beijing_post = BuyPost.objects.create(title = "Beijing book",date_published = datetime.datetime.now(),
            open_until = None, content = "Beijing book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(116.3917, 39.9139), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)
        Seattle_post = BuyPost.objects.create(title = "Seattle book",date_published = datetime.datetime.now(),
            open_until = None, content = "Seattle book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(-122.3331, 47.6097), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)
        portland_post = BuyPost.objects.create(title = "Seattle book",date_published = datetime.datetime.now(),
            open_until = None, content = "Seattle book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(-122.6819, 45.5200), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)
        chicago_post = BuyPost.objects.create(title = "Chicago book",date_published = datetime.datetime.now(),
            open_until = None, content = "Chicago book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(-87.6278, 41.8819), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)
        la_post = BuyPost.objects.create(title = "LA book",date_published = datetime.datetime.now(),
            open_until = None, content = "LA book", category = book_category,
            min_price = None, max_price = None, zipcode = None,
            location_type = 0, latlon = Point(-118.2500, 34.0500), 
            user = other_user, preferred_contacts = "phone",
            is_open = True, image_urls = None)


class FollwedBuyPostTest(TestCase):
    def setUp(self):
        BuyBootstrap().boot()
    def test_buy_post_util(self):
        util = BuyPostUtil()
        # follow a post
        user = User.objects.get(name="Leon")
        post = BuyPost.objects.get(title="Tokyo book")
        util.follow_post(user, post)
        
        # get all the posts followed by a user
        followed_posts = util.get_followed_posts(user)
        self.assertEqual(1, len(followed_posts))
        self.assertEqual(post, followed_posts[0])
        
        # get all the users following a post
        following_users = util.get_following_users(post)
        self.assertEqual(1, len(following_users))
        self.assertEqual(user, following_users[0])


class BuyPostOrderTest(TestCase):
    def setUp(self):
        BuyBootstrap().boot()

    def test_order_by_distance(self):
        """
        Test 
        """
        origin = Point(-122.3317, 47.6244)
        #TODO: enable spatialite to support linear distance calculations on geodetic coordinate systems
        #query_set = BuyPost.objects.distance(origin).order_by('distance')

