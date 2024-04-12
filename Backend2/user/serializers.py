from django.contrib.auth import get_user_model
from rest_framework import serializers

from payments.serializers import BillGetSerializer

User = get_user_model()


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {
            'password': {'required': True},
            'email': {'required': True},
        }


class VerifyUserEmailSerializer(serializers.Serializer):
    token = serializers.CharField()
    uid = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    bill = BillGetSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'date_joined', 'first_name', 'last_name', 'bill')
        read_only_fields = ('date_joined', 'email')
