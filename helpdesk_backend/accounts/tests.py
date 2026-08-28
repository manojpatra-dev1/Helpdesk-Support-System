from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from customers.models import Customer


class RegisterLoginTests(APITestCase):

    def test_register_creates_user_and_customer(self):
        response = self.client.post('/api/auth/register/', {
            'name': 'New User',
            'email': 'newuser@test.com',
            'password': 'strongpass123',
            'confirm_password': 'strongpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser@test.com').exists())
        self.assertTrue(Customer.objects.filter(email='newuser@test.com').exists())

    def test_register_fails_if_passwords_dont_match(self):
        response = self.client.post('/api/auth/register/', {
            'name': 'New User',
            'email': 'newuser2@test.com',
            'password': 'strongpass123',
            'confirm_password': 'differentpass',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_fails_if_email_already_used(self):
        User.objects.create_user(username='dup@test.com', password='pass123')
        response = self.client.post('/api/auth/register/', {
            'name': 'Dup User',
            'email': 'dup@test.com',
            'password': 'strongpass123',
            'confirm_password': 'strongpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_returns_token_and_role(self):
        User.objects.create_user(username='login@test.com', password='mypassword123')
        Customer.objects.create(
            user=User.objects.get(username='login@test.com'),
            name='Login User', email='login@test.com'
        )
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'mypassword123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'customer')

    def test_admin_login_returns_admin_role(self):
        User.objects.create_user(username='admin@test.com', password='adminpass123', is_staff=True)
        response = self.client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'adminpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'admin')
        self.assertIsNone(response.data['customer_id'])

    def test_login_fails_with_wrong_password(self):
        User.objects.create_user(username='wrong@test.com', password='rightpass123')
        response = self.client.post('/api/auth/login/', {
            'email': 'wrong@test.com',
            'password': 'wrongpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)