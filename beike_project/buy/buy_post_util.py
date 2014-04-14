
from data.models import FollowedBuyPost
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist

"""
Util for buy post operations
"""
class BuyPostUtil:

    def __init__(self):
        pass

    def follow_post(self, user, post):
        try: 
            post = FollowedBuyPost.objects.get(user = user, post = post)
            if post.status == 1:
                post.status = 0
                post.save()
        except ObjectDoesNotExist:
            post = FollowedBuyPost(user = user, post = post, last_updated_time = datetime.now(), status = 0)
            post.save()

    def unfollow_post(self, user, post):
        try:
            post = FollowedBuyPost.objects.get(user = user, post = post)
            if post.status == 0:
                post.status = 1
                post.save()
        except ObjectDoesNotExist:
            #do nothing
            print ("No record")

    def get_followed_posts(self, user):
        user_posts = FollowedBuyPost.objects.filter(user = user, status = 0)
        posts = []
        for user_post in user_posts:
            posts.append(user_post.post)
        return posts;

    def get_following_users(self, post):
        user_posts = FollowedBuyPost.objects.filter(post = post, status = 0)
        users = []
        for user_post in user_posts:
            users.append(user_post.user)
        return users

    def is_post_followed_by_user(self, user, post):
        try:
            post = FollowedBuyPost.objects.get(user = user, post = post)
            return post.status == 0
        except ObjectDoesNotExist:
            return False