from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import VerifyEmailView, UserCreateView, UserProfileView

app_name = 'users'

urlpatterns = [
    path('profile/', UserProfileView.as_view()),

    path('register/', UserCreateView.as_view()),
    path('verify/', VerifyEmailView.as_view()),

    path('login/', TokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
]
