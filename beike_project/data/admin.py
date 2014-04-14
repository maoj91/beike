from django.contrib import admin
from data.models import Country
from data.models import State
from data.models import City
from data.models import District
from data.models import User
from data.models import Notification
from data.models import Privacy
from data.models import Address
from data.models import Category
from data.models import Condition
from data.models import BuyPost
from data.models import SellPost
from data.models import Comment
from data.models import FollowedSellPost
from data.models import FollowedBuyPost
from data.models import AWS

admin.site.register(Country)
admin.site.register(State)
admin.site.register(City)
admin.site.register(District)
admin.site.register(User)
admin.site.register(Notification)
admin.site.register(Privacy)
admin.site.register(Address)
admin.site.register(Category)
admin.site.register(Condition)
admin.site.register(BuyPost)
admin.site.register(SellPost)
admin.site.register(Comment)
admin.site.register(FollowedSellPost)
admin.site.register(FollowedBuyPost)
admin.site.register(AWS)
