from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework import generics
from rest_framework import permissions
from rest_framework.response import Response

from src.settings import FRONTEND_HOST
from user.serializers import CreateUserSerializer, UserProfileSerializer
from user.services import UserServicesInterface, UserServiceV1

User = get_user_model()


class UserCreateView(generics.CreateAPIView):
    model = User
    user_services: UserServicesInterface = UserServiceV1()
    permission_classes = [permissions.AllowAny]
    serializer_class = CreateUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sent = self.user_services.create_user(data=serializer.validated_data)
        if sent:
            return Response({"message": "отправлено"})
        return Response({"message": "не отправлено"})


class VerifyEmailView(generics.RetrieveAPIView):
    user_services: UserServicesInterface = UserServiceV1()
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        verified = self.user_services.verify_email(request.query_params)
        if verified:
            return redirect(FRONTEND_HOST)
        return Response({'verified': verified})


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all().select_related('bill')

    def get_serializer_class(self):
        return UserProfileSerializer

    def get_object(self):
        return self.request.user
