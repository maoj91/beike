from django.test import TestCase
from data.models import Category, Condition
from data.views import get_category, get_condition


"""
Category model test cases
"""
class CategoryTest(TestCase):
    def setUp(self):
        Category.objects.create(id=1, name="Books")
        Category.objects.create(id=2, name="Other")

    def test_get_category(self):
        book_category = get_category(1)
        other_category = get_category(2)
        self.assertEqual(book_category.name, "Books")
        self.assertEqual(other_category.name, "Other")

"""
Condition model test cases
"""
class ConditionTest(TestCase):
    def setUp(self):
        Condition.objects.create(id=1, name="New")
        Condition.objects.create(id=2, name="Used")

    def test_get_condition(self):
        new_condition = get_condition(1)
        used_condition = get_condition(2)
        self.assertEqual(new_condition.name, "New")
        self.assertEqual(used_condition.name, "Used")