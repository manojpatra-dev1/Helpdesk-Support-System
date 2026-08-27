from rest_framework import generics, filters
from rest_framework.response import Response
from .models import Customer
from .serializers import CustomerSerializer
from tickets.models import Ticket
from tickets.serializers import TicketSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone']


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class CustomerTicketsListView(generics.ListAPIView):
    serializer_class = TicketSerializer

    def get_queryset(self):
        customer_id = self.kwargs['pk']
        return Ticket.objects.filter(customer_id=customer_id)