from typing import Protocol, OrderedDict
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from rest_framework.generics import get_object_or_404


class UserReposInterface(Protocol):
    def create_user(self, data: OrderedDict): ...

    def authenticate_user(self, data: OrderedDict, request): ...

    def get_user(self, pk: int): ...

    def activate_user(self, pk: int): ...


class UserReposV1:
    model = get_user_model()

    def create_user(self, data: OrderedDict):

        return self.model.objects.create_user(**data)


    def authenticate_user(self, data: OrderedDict, request):
        email = data['email']
        password = data['password']
        user = authenticate(request=request, username=email, password=password)
        if user:
            user.last_login = timezone.now()
            user.save()
        return user

    def get_user(self, pk: int):
        return get_object_or_404(self.model, id=pk)


    def activate_user(self, user: get_user_model()):
        user.is_active = True
        user.save()
