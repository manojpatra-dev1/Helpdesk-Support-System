from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from customers.models import Customer
from tickets.models import Ticket, TicketHistory, Comment


class TicketStatusTransitionTests(APITestCase):

    def setUp(self):
        # Har test se pehle ek customer aur ek ticket bana lo (fresh data)
        self.customer = Customer.objects.create(
            name="Test Customer", email="test@example.com", phone="9999999999"
        )
        self.ticket = Ticket.objects.create(
            customer=self.customer,
            subject="Test Ticket",
            description="Test description",
            category="Network",
            priority=Ticket.Priority.MEDIUM,
        )

    def test_new_ticket_defaults_to_open(self):
        """Business rule: naya ticket hamesha OPEN se start hona chahiye"""
        self.assertEqual(self.ticket.status, Ticket.Status.OPEN)

    def test_valid_status_transition(self):
        """Open -> In Progress allowed hona chahiye"""
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
        self.assertEqual(self.ticket.status, Ticket.Status.OPEN)  # status change nahi hua

    def test_closed_ticket_cannot_change_status(self):
        """Closed ticket ka status change bilkul allowed nahi"""
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save()

        url = f'/api/tickets/{self.ticket.id}/change-status/'
        response = self.client.patch(url, {'status': 'OPEN'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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