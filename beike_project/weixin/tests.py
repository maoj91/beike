"""
Weixin views test
"""

from django.test import TestCase
from weixin import views


class WeixinTest(TestCase):
    def test_create_template(self):
    	msg = {'FromUserName': 'foo', 'ToUserName': 'bar'}
        result = views.create_template(msg, 'http://foo.bar')
        print result
