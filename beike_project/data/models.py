# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.gis.db import models
from data.image_util import get_default_image
from datetime import datetime

class Country(models.Model):
	name = models.CharField(max_length=255)
	currency_code = models.CharField(max_length=10)
	def __unicode__(self):
		return self.name

class State(models.Model):
	name = models.CharField(max_length=255)
	country = models.ForeignKey('Country')
	def __unicode__(self):
		return self.name

class City(models.Model):
	name = models.CharField(max_length=255)
	state = models.ForeignKey(State, null = True)
	country = models.ForeignKey(Country)
	image_url = models.CharField(max_length= 255, null=True)
	image_selected_url = models.CharField(max_length= 255, null=True)
	def __unicode__(self):
		return self.name

class District(models.Model):
	name = models.CharField(max_length=255)
	city = models.ForeignKey(City)
	first_level_district = models.ForeignKey('District', null=True)
	zip_code = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class Privacy(models.Model):
	name = models.CharField(max_length = 255)
	description = models.CharField(max_length = 1000)
	def __unicode__(self):
		return self.name

def get_default_privacy():
	return Privacy.objects.get(id=1)

class Address(models.Model):
	street_line_1 = models.CharField(max_length=255)
	street_line_2 = models.CharField(max_length=255, null=True)
	city = models.ForeignKey(City)
	zip_code = models.CharField(max_length=255, null=True)
	latlon = models.PointField(help_text='Point(longitude, latitude)', null=True)
	# def __unicode__(self):
	# 	return self.street_line_1 + ',' + self.street_line_2 + ',' + self.zip_code


class User(models.Model):
	name = models.CharField(max_length=255, default='张三')
	gender = models.IntegerField()
	age = models.IntegerField(null=True)
	wx_id = models.CharField(max_length=255,unique=True)
	wx_name = models.CharField(max_length=255)
	qq_number = models.CharField(max_length=255, null=True)
	mobile_phone = models.CharField(max_length=255, null=True)
	home_phone = models.CharField(max_length=255, null=True)
	email = models.EmailField(max_length=255, null= True, unique= True)
	address = models.ForeignKey(Address,blank=True, null=True)
	privacy = models.ForeignKey(Privacy, default= get_default_privacy)
	image_url = models.CharField(max_length= 255, null=True, default = get_default_image())
	date_created = models.DateTimeField(default=datetime.now, blank=False)
	description = models.CharField(max_length=3000, default="",null=False)
	organization = models.CharField(max_length=255, default="",null=True)
	def __unicode__(self):
		return self.name

class UserValidation(models.Model):
	user_id = models.CharField(max_length= 255, unique=True)
	key = models.CharField(max_length= 50)
	def __unicode__(self):
		return self.user_id+","+self.key

class Category(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class Condition(models.Model):
	name = models.CharField(max_length=255)
	description = models.CharField(max_length=1000)
	value = models.IntegerField(null=True,default=0)
	def __unicode__(self):
		return self.name

class BuyPost(models.Model):
	title = models.CharField(max_length= 255)
	date_published = models.DateTimeField('post publish date')
	date_closed = models.DateTimeField('post close date', null=True)
	open_until = models.DateTimeField(null=True)
	content = models.CharField(max_length = 4000)
	category = models.ForeignKey('Category')
	min_price = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	max_price = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	zipcode = models.CharField(max_length=255, null=True)
	location_type = models.IntegerField(null=True)
	latlon = models.PointField(help_text='Point(longitude, latitude)', null=True)
	objects = models.GeoManager()
	user = models.ForeignKey('User')
	preferred_contacts = models.CharField(max_length = 255)
	is_open = models.BooleanField(default=True)
	image_urls = models.CharField(max_length= 2000, null=True)
	def __unicode__(self):
		return unicode("%s: %s" % (self.title, self.content[:60]))

class SellPost(models.Model):
	title = models.CharField(max_length= 255)
	date_published = models.DateTimeField('post publish date')
	date_closed = models.DateTimeField('post close date', null=True)
	open_until = models.DateTimeField(null=True)
	content = models.CharField(max_length = 4000)
	category = models.ForeignKey('Category')
	item_condition = models.ForeignKey('Condition', null=True)
	price = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	zipcode = models.CharField(max_length=255, null=True)
	location_type = models.IntegerField(null=True)
	latlon = models.PointField(help_text='Point(longitude, latitude)', null=True)
	objects = models.GeoManager()
	user = models.ForeignKey('User')
	preferred_contacts = models.CharField(max_length = 255)
	is_open = models.BooleanField(default=True)
	image_urls = models.CharField(max_length= 2000)
	def __unicode__(self):
	    return unicode("%s: %s" % (self.title, self.content[:60]))

class FollowedBuyPost(models.Model):
	post = models.ForeignKey('BuyPost')
	user = models.ForeignKey('User')
	status = models.IntegerField()
	last_updated_time = models.DateTimeField()

class FollowedSellPost(models.Model):
	post = models.ForeignKey('SellPost')
	user = models.ForeignKey('User')
	status = models.IntegerField()
	last_updated_time = models.DateTimeField()

class Comment(models.Model):
	#image urls separated by ';'
	image_urls = models.CharField(max_length = 2000, null=True)
	content = models.CharField(max_length= 2000)
	user = models.ForeignKey('User')
	post_type = models.IntegerField()
	post_id = models.IntegerField()
	reply_to = models.ForeignKey('Comment', null=True)
	date_published = models.DateTimeField('comment publish date')
	def __unicode__(self):
		return unicode("%s: %s" % (self.post, self.content[:60]))

class AWS(models.Model):
	access_key = models.CharField(max_length = 200, null=True)
	access_secret = models.CharField(max_length = 200, null=True)
	def __unicode__(self):
		return self.access_key+", "+self.access_secret


