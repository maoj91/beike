from data.models import FollowedSellPost, SellPost
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist

class SellPostUtil:
    def __init__(self):
        pass

    """
    Operations for BuyPost
    """
    def get_post(self, post_id):
        try:
            return SellPost.objects.get(id = post_id)
        except ObjectDoesNotExist:
            return None

    """
    Operations for FollowedBuyPost
    """
    def follow_post(self, user, post):
        try: 
            post = FollowedSellPost.objects.get(user = user, post = post)
            if post.status == 1:
                post.status = 0
                post.save()
        except ObjectDoesNotExist:
            post = FollowedSellPost(user = user, post = post, last_updated_time = datetime.now(), status = 0)
            post.save()

    def unfollow_post(self, user, post):
        try:
            post = FollowedSellPost.objects.get(user = user, post = post)
            if post.status == 0:
                post.status = 1
                post.save()
        except ObjectDoesNotExist:
            #do nothing
            print ("No record")

    def get_followed_posts(self, user):
        user_posts = FollowedSellPost.objects.filter(user = user, status = 0)
        posts = []
        for user_post in user_posts:
            posts.append(user_post.post)
        return posts;

    def get_following_users(self, post):
        user_posts = FollowedSellPost.objects.filter(post = post, status = 0)
        users = []
        for user_post in user_posts:
            users.append(user_post.user)
        return users

    def is_post_followed_by_user(self, user, post):
        try:
            post = FollowedSellPost.objects.get(user = user, post = post)
            return post.status == 0
        except ObjectDoesNotExist:
            return False