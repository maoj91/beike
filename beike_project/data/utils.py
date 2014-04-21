from data.models import UserValidation
import string
import random


# def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
#     return ''.join(random.choice(chars) for _ in range(size))


def getValidationKey(user_id):
	is_key_exist = UserValidation.objects.filter(user_id=user_id).exists()
	if is_key_exist: 
		return UserValidation.objects.get(user_id=user_id).key
	else: 
		validationKey = id_generator()
		userValidation = UserValidation()
		userValidation.user_id = user_id
		userValidation.key = validationKey
		userValidation.save()
		return validationKey
