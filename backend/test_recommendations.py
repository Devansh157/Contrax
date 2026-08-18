import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from contracts.views import ContractViewSet

User = get_user_model()
user = User.objects.first()

factory = APIRequestFactory()
view = ContractViewSet.as_view({'post': 'recommend_contractors'})

def test_query(title, service_type, sub_service, category):
    req = factory.post('/api/contracts/recommend_contractors/', {
        'title': title,
        'service_type': service_type,
        'sub_service': sub_service,
        'category': category,
        'district': 'Ahmedabad',
        'priority': 'Medium',
        'budget': 5000
    }, format='json')
    force_authenticate(req, user=user)
    resp = view(req)
    data = resp.data
    print(f"\n================ QUERY: title='{title}', sub_service='{sub_service}' ================")
    for rec in data['recommendations']:
        reason_clean = rec['reason'].replace('★', ' star')
        print(f"-> {rec['username']} ({rec['match_score']}) | Specialty: {rec['specialty']} | Reason: {reason_clean}")

test_query("", "Painting", "painting", "maintenance")
test_query("", "Plumbing", "plumbing", "maintenance")
test_query("", "Electrical", "electrical", "maintenance")


