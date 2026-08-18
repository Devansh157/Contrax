from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'rating', 'profile_picture', 'wallet_balance', 'is_online', 'latitude', 'longitude', 'bio', 'specialty', 'phone_number', 'is_phone_verified', 'is_email_verified', 'is_superuser', 'is_staff')
        read_only_fields = ('rating', 'wallet_balance', 'is_superuser', 'is_staff')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    specialty = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'role', 'specialty', 'phone_number')

    def validate(self, data):
        confirm_pw = data.get('confirm_password')
        if confirm_pw and data.get('password') != confirm_pw:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        specialty = validated_data.pop('specialty', None)
        phone_number = validated_data.pop('phone_number', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'client'),
            wallet_balance=0.0,
            rating=0.0
        )
        if specialty:
            user.specialty = specialty
        if phone_number:
            user.phone_number = phone_number
        user.is_email_verified = True
        user.save()
        return user


