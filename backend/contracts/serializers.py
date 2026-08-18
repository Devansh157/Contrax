from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Contract, Review

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'role', 'rating', 'profile_picture', 'bio', 'specialty', 'phone_number', 'email')



class ContractSerializer(serializers.ModelSerializer):
    client_detail = UserMinimalSerializer(source='client', read_only=True)
    contractor_detail = UserMinimalSerializer(source='contractor', read_only=True)
    accepted_contractors_details = UserMinimalSerializer(source='accepted_contractors', many=True, read_only=True)
    current_matching_contractor_detail = UserMinimalSerializer(source='current_matching_contractor', read_only=True)
    has_reviewed = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = (
            'id', 'client', 'client_detail', 'contractor', 'contractor_detail',
            'accepted_contractors', 'accepted_contractors_details',
            'title', 'description', 'category', 'sub_service', 'dynamic_attributes', 'duration', 'start_date', 'end_date', 'area_sqft', 'budget', 'predicted_amount', 'status',
            'terms_text', 'client_signature', 'contractor_signature',
            'created_at', 'signed_at', 'completed_at',
            'job_latitude', 'job_longitude', 'contractor_latitude', 'contractor_longitude',
            'current_matching_contractor', 'current_matching_contractor_detail',
            'matching_timestamp', 'declined_contractor_ids', 'has_reviewed'
        )
        read_only_fields = ('client', 'created_at', 'signed_at', 'completed_at', 'terms_text', 'current_matching_contractor', 'matching_timestamp', 'declined_contractor_ids')

    def get_has_reviewed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.reviews.filter(reviewer=request.user).exists()
        return False


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_detail = UserMinimalSerializer(source='reviewer', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'contract', 'reviewer', 'reviewer_detail', 'reviewee', 'rating', 'comment', 'created_at')
        read_only_fields = ('reviewer', 'created_at')
