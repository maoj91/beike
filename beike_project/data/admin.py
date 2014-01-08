from django.contrib import admin
from data.models import User
from data.models import Address
from data.models import State
from data.models import City
from data.models import District
from data.models import Area
from data.models import Category
from data.models import Post
from data.models import Comment
from data.models import Notification
from data.models import Privacy

admin.site.register(User)
admin.site.register(Notification)
admin.site.register(Privacy)
admin.site.register(Address)
admin.site.register(State)
admin.site.register(City)
admin.site.register(District)
admin.site.register(Area)
admin.site.register(Category)
admin.site.register(Post)
admin.site.register(Comment)
