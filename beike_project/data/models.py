# -*- coding: utf-8 -*-
from django.db import models

def decode(info):
	return info.decode('GB2312')

class Country(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class State(models.Model):
	name = models.CharField(max_length=255)
	country = models.ForeignKey('Country')
	def __unicode__(self):
		return self.name

class City(models.Model):
	name = models.CharField(max_length=255)
	state = models.ForeignKey(State)
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

class Notification(models.Model):
	name = models.CharField(max_length = 255)
	description = models.CharField(max_length = 1000)
	def __unicode__(self):
		return self.name

class Privacy(models.Model):
	name = models.CharField(max_length = 255)
	description = models.CharField(max_length = 1000)
	def __unicode__(self):
		return self.name

def get_default_notification():
	return Notification.objects.get(id=1)

def get_default_privacy():
	return Privacy.objects.get(id=1)

class Address(models.Model):
	street_line_1 = models.CharField(max_length=255)
	street_line_2 = models.CharField(max_length=255)
	city = models.CharField(max_length=50)
	state_or_region = models.CharField(max_length=50)
	country = models.CharField(max_length=50, default='US')
	zipcode = models.CharField(max_length=15)
	latitude = models.CharField(max_length=15)
	longitude = models.CharField(max_length=15)
	def __unicode__(self):
		return self.city+','+self.state_or_region

class User(models.Model):
	name = models.CharField(max_length=255, default='新用户')
	wx_id = models.CharField(max_length=255,unique=True)
	wx_name = models.CharField(max_length=255)
	email = models.EmailField(max_length=255, null= True, unique= True)
	address = models.ForeignKey(Address,blank=True, null=True)
	notification = models.ForeignKey(Notification, default=get_default_notification)
	privacy = models.ForeignKey(Privacy, default= get_default_privacy)
	image_url = models.CharField(max_length= 255, null=True)

class Category(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class Condition(models.Model):
	name = models.CharField(max_length=255)
	description = models.CharField(max_length=1000)
	def __unicode__(self):
		return self.name

class Post(models.Model):
	title = models.CharField(max_length= 255)
	date_published = models.DateTimeField('post publish date')
	open_until = models.DateTimeField()
	content = models.CharField(max_length = 4000)
	phone = models.CharField(max_length = 20, null=True)
	prefer_contact = models.IntegerField(default=1)
	category = models.ForeignKey('Category')
	#used by sell post
	quote_price = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	#used by buy post
	ask_price_min = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	ask_price_max = models.DecimalField(max_digits=8, decimal_places=2, null=True)
	item_condition = models.ForeignKey('Condition', null=True)
	user = models.ForeignKey('User')
	is_buy = models.BooleanField(default=True)
	is_open = models.BooleanField(default=True)
	#image urls separated by ';'
	image_urls = models.CharField(max_length= 2000)
	def __unicode__(self):
		return unicode("%s: %s" % (self.title, self.content[:60]))

class Comment(models.Model):
	#image urls separated by ';'
	image_urls = models.CharField(max_length = 2000)
	content = models.CharField(max_length= 2000)
	user = models.ForeignKey('User')
	post = models.ForeignKey('Post')
	reply_to = models.ForeignKey('Comment', null=True)
	date_published = models.DateTimeField('comment publish date')
	def __unicode__(self):
		return unicode("%s: %s" % (self.post, self.content[:60]))


