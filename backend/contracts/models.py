from django.db import models
from django.conf import settings

class Contract(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('searching', 'Searching Contractors'),
        ('offered', 'Offered'),
        ('active', 'Active (Signed)'),
        ('completed', 'Completed by Contractor'),
        ('approved', 'Approved & Paid'),
        ('cancelled', 'Cancelled'),
    )

    CATEGORY_CHOICES = (
        ('delivery', 'On-Demand Delivery'),
        ('maintenance', 'Home Maintenance & Repair'),
        ('creative', 'Freelance & Creative'),
        ('legal', 'Professional/Legal Services'),
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_contracts'
    )
    contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='contractor_contracts', 
        null=True, 
        blank=True
    )
    accepted_contractors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='accepted_contracts',
        blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='delivery')
    sub_service = models.CharField(max_length=100, blank=True, null=True)
    dynamic_attributes = models.JSONField(default=dict, blank=True, null=True)
    duration = models.CharField(max_length=50, default='1 Day', blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    area_sqft = models.FloatField(default=1000.0, blank=True)
    budget = models.FloatField(default=0.0)
    predicted_amount = models.FloatField(default=0.0, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    terms_text = models.TextField()
    
    # Store Base64 signature strings from signature canvas
    client_signature = models.TextField(null=True, blank=True)
    contractor_signature = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Location coordinates for mapping (Simulating Uber/Rapido pick-up/destination or job location)
    job_latitude = models.FloatField(default=23.0225) # Default coordinates in Ahmedabad/similar
    job_longitude = models.FloatField(default=72.5714)
    contractor_latitude = models.FloatField(null=True, blank=True)
    contractor_longitude = models.FloatField(null=True, blank=True)

    # Uber-style sequential matching fields
    current_matching_contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='current_offers',
        null=True,
        blank=True
    )
    matching_timestamp = models.DateTimeField(null=True, blank=True)
    declined_contractor_ids = models.TextField(default='', blank=True)

    def __str__(self):
        return f"{self.title} - {self.status}"


class Review(models.Model):
    contract = models.ForeignKey(
        Contract, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_written'
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_received'
    )
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.reviewee.username} - {self.rating}★"

