import json
from data.models import Condition

def get_contact(phone_checked,email_checked,sms_checked,phone_number,email):
        contact = {
            'phone_checked': phone_checked,
            'email_checked': email_checked,
            'sms_checked': sms_checked,
            'phone_number': phone_number,
            'email': email,
        }
        return json.dumps(contact)

def get_condition(condition_value):
	condition = Condition.objects.get(value=condition_value)
	if condition is None: 
		condition = Condition.objects.get(value=0)
	return condition
