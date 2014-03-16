from django.core.signing import Signer
import time, operator
from django.db.models import Q
from data.models import User,Address,City,Category, District, BuyPost, SellPost
from validate_email import validate_email

# SellPost
def get_sell_posts(category, title, min_price, max_price, district_id):
    query_conditions = []
    if title:
        query_conditions.append(Q(title__icontains=title))
    if min_price:
        query_conditions.append(Q(price__gte=min_price))
    if max_price:
        query_conditions.append(Q(price__lte=max_price))
    if district_id:
        query_conditions.append(Q(district__id=district_id))
    result = SellPost.objects.filter(reduce(operator.and_, query_conditions))
    return result

# BuyPost
def get_buy_posts(category_id, title, max_price, district_id):
    query_conditions = []
    if category_id:
        query_conditions.append(Q(category__id=category_id))
    if title:
        query_conditions.append(Q(title__icontains=title))
    if max_price:
        query_conditions.append(Q(max_price__gte=max_price))
    if district_id:
        query_conditions.append(Q(district__id=district_id))
    result = BuyPost.objects.filter(reduce(operator.and_, query_conditions))
    return result

#District
def get_district(district_id):
    district = District.objects.get(id = district_id)
    return district

# User
def is_user_exist(user_id):
    exist = User.objects.filter(wx_id=user_id).exists()
    if(exist):
        user = User.objects.get(wx_id=user_id)
        user.lastlogin = time.time()
        user.save()
    return exist

def get_lastlogin(user_id):
    user = User.objects.get(wx_id=user_id)
    return user.lastlogin

def get_user(user_id):
    user = User.objects.get(wx_id=user_id)
    return user

def get_category(category_id):
    category = Category.objects.get(id=category_id)
    return category

def is_user_has_email(user_id):
    if not is_user_exist(user_id):
        return false
    user = get_user(user_id)
    if user.email is None or '':
        return False
    else:
        return True

def create_user(user_id,email,city_id):
    if not is_user_exist(user_id):
        user = User()
        user.wx_id = user_id
        user.gender = 3
        address = Address()
        city = City.objects.get(pk=city_id)
        address.city = city
        address.save()
        user.address = address
        user.email = email
        user.save()

def set_user_email(user_id,content):
    user = get_user(user_id)
    user.email = content
    user.save()

def is_email_valid(email):
    is_valid = validate_email(email)
    is_exist = False 
    if User.objects.filter(email=email):
        is_exist = True 
    if not is_exist and is_valid:
        return True
    else:
        return False