from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from customers.models import Customer
from tickets.models import Ticket, TicketHistory, Comment


class TicketStatusTransitionTests(APITestCase):

    def setUp(self):
        # Admin user banao aur login karo (kyunki status-change sirf admin kar sakta hai)
        self.admin_user = User.objects.create_user(
            username="admin@test.com", email="admin@test.com",
            password="adminpass123", is_staff=True
        )
        self.customer_user = User.objects.create_user(
            username="cust@test.com", email="cust@test.com", password="custpass123"
        )
        self.customer = Customer.objects.create(
            user=self.customer_user, name="Test Customer", email="cust@test.com", phone="9999999999"
        )
        self.ticket = Ticket.objects.create(
            customer=self.customer,
            subject="Test Ticket",
            description="Test description",
            category="Network",
            priority=Ticket.Priority.MEDIUM,
        )
        # default: admin ke tor pe login rahega, jahan customer chahiye wahan alag se authenticate karenge
        self.client.force_authenticate(user=self.admin_user)

    def test_new_ticket_defaults_to_open(self):
        """Business rule: naya ticket hamesha OPEN se start hona chahiye"""
        self.assertEqual(self.ticket.status, Ticket.Status.OPEN)

    def test_valid_status_transition(self):
        """Open -> In Progress allowed hona chahiye (admin karega)"""
        url = f'/api/tickets/{self.ticket.id}/change-status/'
        response = self.client.patch(url, {'status': 'IN_PROGRESS'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.IN_PROGRESS)

    def test_invalid_status_skip_not_allowed(self):
        """Open -> Resolved (seedha skip) allowed NAHI hona chahiye"""
        url = f'/api/tickets/{self.ticket.id}/change-status/'
        response = self.client.patch(url, {'status': 'RESOLVED'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.OPEN)

    def test_closed_ticket_cannot_change_status(self):
        """Closed ticket ka status change bilkul allowed nahi"""
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save()

        url = f'/api/tickets/{self.ticket.id}/change-status/'
        response = self.client.patch(url, {'status': 'OPEN'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_cannot_change_status(self):
        """Customer status change NAHI kar sakta — sirf admin"""
        self.client.force_authenticate(user=self.customer_user)
        url = f'/api/tickets/{self.ticket.id}/change-status/'
        response = self.client.patch(url, {'status': 'IN_PROGRESS'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_closed_ticket_cannot_add_comment(self):
        """Closed ticket pe comment add nahi hona chahiye"""
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save()

        url = f'/api/tickets/{self.ticket.id}/add-comment/'
        response = self.client.post(url, {'text': 'test comment'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_closed_ticket_cannot_be_edited(self):
        """Closed ticket ka subject/description/priority bhi edit nahi hona chahiye"""
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save()

        url = f'/api/tickets/{self.ticket.id}/'
        response = self.client.put(url, {
            'subject': 'Changed subject',
            'description': 'Changed',
            'category': 'Network',
            'priority': 'HIGH',
            'customer': self.customer.id,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_change_creates_history_entry(self):
        """Status change hone pe TicketHistory me entry banni chahiye"""
        url = f'/api/tickets/{self.ticket.id}/change-status/'
        self.client.patch(url, {'status': 'IN_PROGRESS'}, format='json')

        history_count = TicketHistory.objects.filter(ticket=self.ticket).count()
        self.assertEqual(history_count, 1)

    def test_ticket_requires_valid_customer(self):
        """Ticket bina valid customer ke create nahi hona chahiye"""
        url = '/api/tickets/'
        response = self.client.post(url, {
            'customer': 9999,  # non-existent customer
            'subject': 'Bad ticket',
            'description': 'Test',
            'category': 'Network',
            'priority': 'LOW',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TicketRoleAccessTests(APITestCase):
    """Role-based access ke tests — admin sab dekhe, customer sirf apna"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin2@test.com", password="adminpass123", is_staff=True
        )
        self.user_a = User.objects.create_user(username="a@test.com", password="pass123")
        self.user_b = User.objects.create_user(username="b@test.com", password="pass123")
        self.customer_a = Customer.objects.create(user=self.user_a, name="A", email="a@test.com")
        self.customer_b = Customer.objects.create(user=self.user_b, name="B", email="b@test.com")

        self.ticket_a = Ticket.objects.create(
            customer=self.customer_a, subject="A ticket", description="d", category="c"
        )
        self.ticket_b = Ticket.objects.create(
            customer=self.customer_b, subject="B ticket", description="d", category="c"
        )

    def test_anonymous_user_blocked(self):
        """Login kiye bina koi bhi ticket API access nahi hona chahiye"""
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_sees_all_tickets(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_customer_sees_only_own_tickets(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.ticket_a.id)

    def test_customer_cannot_view_other_customers_ticket_detail(self):
        """Customer A doosre (B) ka ticket detail URL se access na kar sake"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/tickets/{self.ticket_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_new_ticket_auto_assigned_to_self(self):
        """Customer jab naya ticket banaye to wo automatic uske apne naam se bane"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post('/api/tickets/', {
            'subject': 'New issue', 'description': 'desc', 'category': 'Network', 'priority': 'LOW'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['customer'], self.customer_a.id)

    def test_customer_cannot_view_dashboard(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/tickets/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_view_dashboard(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/tickets/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)