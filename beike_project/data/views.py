from data.models import User
from data.models import Area

def is_user_exist(user_id):
	user_count = User.objects.filter(wx_id=user_id).count()
	return user_count>0

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


def create_user(user_id):
	if not is_user_exist(user_id):
		user = User()
		user.wx_id = user_id
		user.area = get_default_area()
		user.save()

def set_user_email(user_id,content):
	user = get_user(user_id)
	user.email = content
	user.save()

def get_default_area():
	area = Area.objects.get(pk=1)
	return area

