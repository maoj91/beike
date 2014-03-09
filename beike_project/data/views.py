from django.core.signing import Signer
import time
from data.models import User,Address,City
from validate_email import validate_email

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
        address = Address()
        city = City.objects.get(pk=city_id)
        address.city = city.name
        address.state_or_region = city.state.name
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