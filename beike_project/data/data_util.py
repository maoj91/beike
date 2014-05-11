import json

def get_contact(phone_checked,email_checked,qq_checked,phone_number,email,qq_number):
        contact = {
            'phone_checked': phone_checked,
            'email_checked': email_checked,
            'qq_checked': qq_checked,
            'phone_number': phone_number,
            'email': email,
            'qq_number': qq_number,
        }
        return json.dumps(contact)