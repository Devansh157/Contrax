from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('contractor', 'Contractor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='client')
    rating = models.FloatField(default=0.0)
    profile_picture = models.TextField(blank=True, null=True) # URL or Base64
    wallet_balance = models.FloatField(default=0.0)
    is_online = models.BooleanField(default=False)
    latitude = models.FloatField(default=23.0225)
    longitude = models.FloatField(default=72.5714)
    bio = models.TextField(blank=True, null=True)
    specialty = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"


class OTPVerification(models.Model):
    phone_number = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.phone_number} - {self.otp_code} (Verified: {self.is_verified})"


class EmailOTPVerification(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} - {self.otp_code} (Verified: {self.is_verified})"




