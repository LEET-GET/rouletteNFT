from typing import Protocol, OrderedDict

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from user.repos import UserReposInterface, UserReposV1
from user.tasks import send_message_to_email


class UserServicesInterface(Protocol):
    def create_user(self, data: OrderedDict): ...

    def verify_email(self, data: OrderedDict): ...

    def generate_token(self, data: OrderedDict, request): ...


class UserServiceV1:
    user_repos: UserReposInterface = UserReposV1()

    def create_user(self, data: OrderedDict):
        user = self.user_repos.create_user(data)
        pk = user.pk
        token = default_token_generator.make_token(user)
        uid = force_str(urlsafe_base64_encode(force_bytes(pk)))
        send_message_to_email.delay(email=user.email,
                                    token=token,
                                    uid=uid)
        return True

    def verify_email(self, data: OrderedDict):
        pk = force_str(urlsafe_base64_decode(data['uid']))
        token = data['token']
        user = self.user_repos.get_user(pk=pk)
        if default_token_generator.check_token(user, token):
            self.user_repos.activate_user(user)
            return True
        return False

    def generate_token(self, data: OrderedDict, request):
        user = self.user_repos.authenticate_user(data=data, request=request)
        if not user:
            return "Incorrect email or password"
        access_token = AccessToken.for_user(user)
        refresh_token = RefreshToken.for_user(user)
        data = {
            'access_token': str(access_token),
            'refresh_token': str(refresh_token),
        }
        return data

