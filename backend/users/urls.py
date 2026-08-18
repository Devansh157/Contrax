from django.urls import path
from .views import RegisterAPI, LoginAPI, UserAPI, AdminUserListAPI, SendOTPAPI, VerifyOTPAPI, SendEmailOTPAPI, VerifyEmailOTPAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('send-email-otp/', SendEmailOTPAPI.as_view(), name='send_email_otp'),
    path('verify-email-otp/', VerifyEmailOTPAPI.as_view(), name='verify_email_otp'),
    path('send-otp/', SendOTPAPI.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPAPI.as_view(), name='verify_otp'),
    path('me/', UserAPI.as_view(), name='me'),
    path('user/', UserAPI.as_view(), name='user'),
    path('admin/users/', AdminUserListAPI.as_view(), name='admin_users'),
]


