from django import template
from django.template.defaultfilters import stringfilter
import time

register = template.Library()

@register.filter
@stringfilter
def split(string, token):
    return string.split(token)

@register.filter
@stringfilter
def get_time(t):
    return t[0]+t[1]+t[2]+t[3]+'/'+t[5]+t[6]+'/'+t[8]+t[9]
