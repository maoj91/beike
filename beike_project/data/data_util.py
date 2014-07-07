import json

def get_contact(phone_checked,email_checked,sms_checked,phone_number,email):
        contact = {
            'phone_checked': phone_checked,
            'email_checked': email_checked,
            'sms_checked': sms_checked,
            'phone_number': phone_number,
            'email': email,
        }
        return json.dumps(contact)