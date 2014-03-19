from django.http import Http404,HttpResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from data.models import SellPost, BuyPost, User, Comment
from data.views import get_user
from detail.forms import CommentForm
import smtplib
from email.mime.text import MIMEText
import datetime

@csrf_exempt
def add_comment_buy(request, user_id, post_id):
	if request.method == 'POST':
		form = CommentForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data
			content = cd['content']
		comment = Comment()

		comment.buy_post = BuyPost.objects.get(id=post_id)
		comment.user = User.objects.get(wx_id=user_id)
		comment.content = content
		comment.date_published = datetime.datetime.now()
		
		comment.image_urls = request.POST.get('image_names','') 
		comment.save()
		sendEmail(comment)
	return HttpResponseRedirect("/"+user_id+"/detail/"+post_id)

def add_comment_sell(request, user_id, post_id):
	if request.method == 'POST':
		form = CommentForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data
			content = cd['content']
		comment = Comment()
		comment.sell_post = SellPost.objects.get(id=post_id)
		comment.user = User.objects.get(wx_id=user_id)
		comment.content = content
		comment.date_published = datetime.datetime.now()
		
		comment.image_urls = request.POST.get('image_names','') 
		comment.save()
		sendEmail(comment)
	return HttpResponseRedirect("/"+user_id+"/detail/"+post_id)

def sell_post_detail(request,offset,user_id):
	try:
		offset = int(offset)
	except ValueError:
		raise Http404()
	post = SellPost.objects.get(id=offset)
	comment_form = CommentForm()
	comments = Comment.objects.filter(post_id=post.id, post_type=2)
	return render_to_response('sell_post_detail.html', {'post':post,'comment_form':comment_form,'comments':comments,'wx_id':user_id})

def buy_post_detail(request,offset,user_id):
	try:
		offset = int(offset)
	except ValueError:
		raise Http404()
	post = BuyPost.objects.get(id=offset)
	comment_form = CommentForm()
	comments = Comment.objects.filter(post_id=post.id, post_type=1)
	return render_to_response('buy_post_detail.html', {'post':post,'comment_form':comment_form,'comments':comments,'wx_id':user_id})

def sendEmail(comment):
	post = comment.post
 	commenter = post.user
	publisher = post.user	
	to = post.user.email
	subject = "[Beike]New reply for:"+post.title
	content = "<br/>You have new reply for your post:"+post.title+"<br/>"+comment.content  
	send_email(to,subject,content)

def send_email(to,subject,text):
    message = """From: <fromEmail>
To: <toEmail>
MIME-Version: 1.0
Content-type: text/html
Subject: subject_template

content_template
"""
    message = message.replace("fromEmail","beike")
    message = message.replace("toEmail",to)
    message = message.replace("subject_template",subject)
    message = message.replace("content_template",text)
    gmail_user = "homeinshell@gmail.com"
    gmail_pwd = "shellinhome"
    FROM = "homeinshell@gmail.com"
    TO = to
    result = False
    try:
            server = smtplib.SMTP("smtp.gmail.com",587)
            server.ehlo()
            server.starttls()
            server.login(gmail_user,gmail_pwd)
            server.sendmail(FROM,TO,message)
            server.close()
            result = True
    except:
            result = False
    return result
