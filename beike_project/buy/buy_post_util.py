
from data.models import FollowedBuyPost, BuyPost
from datetime import datetime
import logging
from django.core.exceptions import ObjectDoesNotExist

# Use package_name.module_name for logger
logger = logging.getLogger('buy.buy_post_util')

"""
Util for buy post operations
"""
class BuyPostUtil:

    def __init__(self):
        pass

    """
    Operations for BuyPost
    """
    def get_post(self, post_id):
        try:
            return BuyPost.objects.get(id = post_id)
        except ObjectDoesNotExist:
            return None


    """
    Operations for FollowedBuyPost
    """

    def follow_post(self, user, post):
        try: 
            post = FollowedBuyPost.objects.get(user = user, post = post)
            if post.status == 1:
                post.status = 0
                post.save()
        except ObjectDoesNotExist:
            post = FollowedBuyPost(user = user, post = post, last_updated_time = datetime.now(), status = 0)
            post.save()
        logger.info("User " + str(user.id) + " successfully follow buy post " + str(post.id))

    def unfollow_post(self, user, post):
        try:
            post = FollowedBuyPost.objects.get(user = user, post = post)
            if post.status == 0:
                post.status = 1
                post.save()
            logger.info("User " + str(user.id) + " successfully unfollow buy post " + str(post.id))
        except ObjectDoesNotExist:
            #do nothing
            logger.info("User " + str(user.id) + " does not follow buy post " + str(post.id))

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