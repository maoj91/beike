from django.db import models

class State(models.Model):
	name = models.CharField(max_length=50)

class City(models.Model):
	name = models.CharField(max_length=50)
	state = models.ForeignKey(State)

class District(models.Model):
	name = models.CharField(max_length=50)
	city = models.ForeignKey(City)

class Area(models.Model):
	community = models.CharField(max_length=50)
	district = models.CharField(max_length=50)
	city = models.CharField(max_length=50)
	state_or_region = models.CharField(max_length=50)
	country = models.CharField(max_length=50, default='US')
	zipcode = models.CharField(max_length=15)


class User(models.Model):
	name = models.CharField(max_length=50)
	wx_id = models.CharField(max_length=50,unique=True)
	wx_name = models.CharField(max_length=50)
	email = models.EmailField(max_length=70,blank=True, null= True, unique= True)
	area = models.ForeignKey(Area)

class Address(models.Model):
	street_line_1 = models.CharField(max_length=50)
	street_line_2 = models.CharField(max_length=50)
	city = models.CharField(max_length=50)
	state_or_region = models.CharField(max_length=50)
	country = models.CharField(max_length=50, default='US')
	zipcode = models.CharField(max_length=15)
	latitude = models.CharField(max_length=15)
	longitude = models.CharField(max_length=15)

class Category(models.Model):
	name = models.CharField(max_length=50)
	def __unicode__(self):
		return self.name

class Post(models.Model):
	title = models.CharField(max_length= 60)
	date_published = models.DateTimeField('post publish date')
	content = models.CharField(max_length = 500)
	category = models.ForeignKey(Category)
	price_num = models.IntegerField(default=0)
	price_unit = models.CharField(max_length=10,default='USD')
	user = models.ForeignKey(User)
	is_buy = models.BooleanField(default=True)
	#image urls separated by ';'
	image_urls = models.CharField(max_length= 300)
	def __unicode__(self):
		return unicode("%s: %s" % (self.title, self.content[:60]))

class Comment(models.Model):
	#image urls separated by ';'
	image_urls = models.CharField(max_length = 300)
	content = models.CharField(max_length= 300)
	user = models.ForeignKey(User)
	post = models.ForeignKey(Post)
	date_published = models.DateTimeField('comment publish date')
	def __unicode__(self):
		return unicode("%s: %s" % (self.post, self.content[:60]))
