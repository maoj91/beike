
from data.models import FollowedBuyPost
from datetime import datetime

"""
Util for buy post operations
"""
class BuyPostUtil:

    def __init__(self):
        pass

    def follow_post(self, user, post):
        followed_post = FollowedBuyPost(user = user, post = post, last_updated_time = datetime.now())
        followed_post.save()
        return followed_post

    def get_followed_posts(self, user):
        user_posts = FollowedBuyPost.objects.filter(user = user)
        posts = []
        for user_post in user_posts:
            posts.append(user_post.post)
        return posts;

    def get_following_users(self, post):
        user_posts = FollowedBuyPost.objects.filter(post = post)
        users = []
        for user_post in user_posts:
            users.append(user_post.user)
        return users

    def is_post_followed_by_user(self, post, user):
        pass