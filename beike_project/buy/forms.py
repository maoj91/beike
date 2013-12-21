from django import forms
from data.models import Category

class BuyForm(forms.Form):
	title = forms.CharField(label="Title")
	price = forms.CharField(label="Price")
	content = forms.CharField()
	category = forms.ModelChoiceField(queryset=Category.objects.all(),initial=0)
