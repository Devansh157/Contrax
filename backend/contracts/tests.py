from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Contract, Review

User = get_user_model()

class ContractLifecycleTestCase(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(username='client1', email='client1@example.com', password='password123', role='client', wallet_balance=10000.0)
        self.contractor_user = User.objects.create_user(username='contractor1', email='contractor1@example.com', password='password123', role='contractor', wallet_balance=10000.0)


        
        self.api_client = APIClient()
        self.api_contractor = APIClient()
        
        # Authenticate clients
        response = self.api_client.post('/api/auth/login/', {'username': 'client1', 'password': 'password123'})
        self.client_token = response.data['token']
        self.api_client.credentials(HTTP_AUTHORIZATION='Token ' + self.client_token)

        response = self.api_contractor.post('/api/auth/login/', {'username': 'contractor1', 'password': 'password123'})
        self.contractor_token = response.data['token']
        self.api_contractor.credentials(HTTP_AUTHORIZATION='Token ' + self.contractor_token)

    def test_full_contract_lifecycle(self):
        # 1. Create a contract request by Client (starting balance: 10000.0)
        payload = {
            'title': 'Test Delivery Contract',
            'description': 'Deliver package from point A to point B',
            'category': 'delivery',
            'budget': 350.0,
            'job_latitude': 23.0,
            'job_longitude': 72.0
        }
        response = self.api_client.post('/api/contracts/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        contract_id = response.data['id']
        
        contract = Contract.objects.get(id=contract_id)
        self.assertEqual(contract.status, 'searching')
        self.assertEqual(contract.client, self.client_user)
        self.assertIsNone(contract.contractor)

        # Assert wallet balance deducted
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, 9650.0)

        # 2. Accept contract by Contractor
        response = self.api_contractor.post(f'/api/contracts/{contract_id}/accept/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'offered')
        self.assertEqual(response.data['contractor_detail']['username'], 'contractor1')

        # 3. Client Signs
        response = self.api_client.post(f'/api/contracts/{contract_id}/sign/', {'signature': 'data:image/png;base64,client_sig'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'offered') # still offered, contractor has not signed yet

        # 4. Contractor Signs
        response = self.api_contractor.post(f'/api/contracts/{contract_id}/sign/', {'signature': 'data:image/png;base64,contractor_sig'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'active') # now active since both signed

        # 5. Contractor completes work
        response = self.api_contractor.post(f'/api/contracts/{contract_id}/submit_work/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')

        # 6. Client approves and pays (Contractor starting balance: 10000.0)
        response = self.api_client.post(f'/api/contracts/{contract_id}/approve_and_pay/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')

        # Assert wallet balance released to contractor
        self.contractor_user.refresh_from_db()
        self.assertEqual(self.contractor_user.wallet_balance, 10350.0)

        # 7. Submit reviews
        # Client reviews Contractor
        response = self.api_client.post(f'/api/contracts/{contract_id}/submit_review/', {'rating': 5, 'comment': 'Excellent service!'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.contractor_user.refresh_from_db()
        self.assertEqual(self.contractor_user.rating, 5.0)

        # Contractor reviews Client
        response = self.api_contractor.post(f'/api/contracts/{contract_id}/submit_review/', {'rating': 4, 'comment': 'Nice client.'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.rating, 4.0)

    def test_contract_cancellation_refund(self):
        # 1. Create a contract request by Client (starting balance: 10000.0)
        payload = {
            'title': 'Test Cancel Contract',
            'description': 'Deliver package, to be cancelled',
            'category': 'delivery',
            'budget': 500.0,
            'job_latitude': 23.0,
            'job_longitude': 72.0
        }
        response = self.api_client.post('/api/contracts/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        contract_id = response.data['id']

        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, 9500.0)

        # 2. Cancel contract by Client
        response = self.api_client.post(f'/api/contracts/{contract_id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'cancelled')

        # Assert balance is refunded to Client
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, 10000.0)

    def test_sequential_nearest_matching(self):
        from django.utils import timezone
        import datetime

        # Create two more contractors
        contractor_close = User.objects.create_user(
            username='contractor_close', password='password123', role='contractor',
            is_online=True, latitude=23.0220, longitude=72.5710
        )
        contractor_far = User.objects.create_user(
            username='contractor_far', password='password123', role='contractor',
            is_online=True, latitude=23.1000, longitude=72.7000
        )

        # Authenticate contractor_close
        api_close = APIClient()
        res = api_close.post('/api/auth/login/', {'username': 'contractor_close', 'password': 'password123'})
        api_close.credentials(HTTP_AUTHORIZATION='Token ' + res.data['token'])

        # Authenticate contractor_far
        api_far = APIClient()
        res = api_far.post('/api/auth/login/', {'username': 'contractor_far', 'password': 'password123'})
        api_far.credentials(HTTP_AUTHORIZATION='Token ' + res.data['token'])

        # Create contract request by Client (Job site in Ahmedabad center: 23.0225, 72.5714)
        payload = {
            'title': 'Uber Proximity Test',
            'description': 'Sequential matching test',
            'category': 'delivery',
            'budget': 200.0,
            'job_latitude': 23.0225,
            'job_longitude': 72.5714
        }
        response = self.api_client.post('/api/contracts/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        contract_id = response.data['id']

        contract = Contract.objects.get(id=contract_id)
        # Mark setUp contractor_user as already declined for this test
        contract.declined_contractor_ids = str(self.contractor_user.id)
        contract.save()

        # Verify that contractor_close (closest online) is assigned
        contract = Contract.objects.get(id=contract_id)
        self.assertEqual(contract.current_matching_contractor, contractor_close)

        # contractor_close declines the offer
        response = api_close.post(f'/api/contracts/{contract_id}/decline/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify matching shifts to contractor_far (the only other online contractor)
        contract.refresh_from_db()
        self.assertEqual(contract.current_matching_contractor, contractor_far)
        self.assertIn(str(contractor_close.id), contract.declined_contractor_ids)

        # Simulate timeout: set matching_timestamp back by 65 seconds
        contract.matching_timestamp = timezone.now() - datetime.timedelta(seconds=65)
        contract.save()

        # Retrieve contract via API (which triggers the get_queryset check/update)
        response = self.api_client.get(f'/api/contracts/{contract_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify it has timed out and no online contractor is left, clearing current_matching_contractor
        contract.refresh_from_db()
        self.assertIsNone(contract.current_matching_contractor)
        self.assertIn(str(contractor_far.id), contract.declined_contractor_ids)

