from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserWalletTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', 
            password='password123', 
            role='client',
            wallet_balance=10000.0
        )
        self.client = APIClient()
        # Authenticate
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'})
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_get_user_profile(self):
        response = self.client.get('/api/auth/user/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['wallet_balance'], 10000.0)

    def test_wallet_top_up(self):
        response = self.client.post('/api/auth/user/', {
            'action': 'top_up',
            'amount': 500.0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wallet_balance'], 10500.0)

    def test_wallet_withdraw_valid(self):
        response = self.client.post('/api/auth/user/', {
            'action': 'withdraw',
            'amount': 500.0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wallet_balance'], 9500.0)

    def test_wallet_withdraw_below_min_limit(self):
        response = self.client.post('/api/auth/user/', {
            'action': 'withdraw',
            'amount': 50.0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Minimum withdrawal amount is", response.data['error'])

    def test_wallet_withdraw_large_amount(self):
        self.user.wallet_balance = 70000.0
        self.user.save()
        response = self.client.post('/api/auth/user/', {
            'action': 'withdraw',
            'amount': 60000.0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wallet_balance'], 10000.0)

    def test_wallet_withdraw_insufficient_funds(self):
        # Set balance to 500
        self.user.wallet_balance = 500.0
        self.user.save()
        
        response = self.client.post('/api/auth/user/', {
            'action': 'withdraw',
            'amount': 600.0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'insufficient funds')
