from django.db import models
from django.contrib.auth.models import AbstractUser
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    @staticmethod
    def get_user(data):
        return get_object_or_404(User, **data)

    def create_user(self, password: str = None, **kwargs) -> 'User':
        user = self.model(**kwargs)
        user.is_active = False
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, password: str = None, **kwargs) -> 'User':
        user = self.model(
            is_active=True,
            is_staff=True,
            is_superuser=True,
            **kwargs
        )
        user.set_password(password)
        user.save()
        return user


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=False, null=True, blank=True)
    email = models.EmailField(null=True, max_length=254, verbose_name='email address', unique=True)

    objects = UserManager()

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'auth_user'


