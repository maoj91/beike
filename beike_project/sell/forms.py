# -*- coding: utf-8 -*-
from django import forms
from data.models import Category

class SellTextForm(forms.Form):
	title = forms.CharField(label="标题")
	price = forms.CharField(label="价格")
	content = forms.CharField(label="其他描述")
	category = forms.ModelChoiceField(queryset=Category.objects.all(),initial=0,label="类别")


class SellImageForm(forms.Form):
	image  = forms.FileField(required=False)


