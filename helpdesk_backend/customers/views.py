from rest_framework import generics, filters
from rest_framework.response import Response
from accounts.permissions import IsAdminRole
from .models import Customer
from .serializers import CustomerSerializer
from tickets.models import Ticket
from tickets.serializers import TicketSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone']
    permission_classes = [IsAdminRole]  # sirf admin sabhi customers dekh sake


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Customer.objects.all()
        return Customer.objects.filter(user=user)  # customer sirf apna profile


class CustomerTicketsListView(generics.ListAPIView):
    serializer_class = TicketSerializer

    def get_queryset(self):
        customer_id = self.kwargs['pk']
        user = self.request.user
        if not user.is_staff and not Customer.objects.filter(id=customer_id, user=user).exists():
            return Ticket.objects.none()  # dusre customer ka data nahi dikhega
        return Ticket.objects.filter(customer_id=customer_id)