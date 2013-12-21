from django import forms
from data.models import Category

class SellTextForm(forms.Form):
	title = forms.CharField(label="Title")
	price = forms.CharField(label="Price")
	content = forms.CharField()
	category = forms.ModelChoiceField(queryset=Category.objects.all(),initial=0)


class SellImageForm(forms.Form):
	image  = forms.FileField(required=False)


