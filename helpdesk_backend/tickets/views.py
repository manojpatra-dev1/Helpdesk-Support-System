from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Ticket, TicketHistory, Comment
from .serializers import (
    TicketSerializer, TicketStatusUpdateSerializer,
    CommentSerializer, TicketHistorySerializer
)


class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['subject', 'description']


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        if ticket.status == Ticket.Status.CLOSED:
            return Response(
                {"detail": "Closed ticket ko edit nahi kar sakte."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)


class TicketChangeStatusView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketStatusUpdateSerializer

    def patch(self, request, *args, **kwargs):
        ticket = self.get_object()
        serializer = self.get_serializer(ticket, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_status = ticket.status
        serializer.save()

        TicketHistory.objects.create(
            ticket=ticket,
            change_description=f"Status changed from {old_status} to {ticket.status}"
        )
        return Response(TicketSerializer(ticket).data)


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['ticket'] = self.kwargs['pk']
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TicketHistoryListView(generics.ListAPIView):
    serializer_class = TicketHistorySerializer

    def get_queryset(self):
        return TicketHistory.objects.filter(ticket_id=self.kwargs['pk'])


class DashboardStatsView(APIView):
    def get(self, request):
        qs = Ticket.objects.all()
        data = {
            'total': qs.count(),
            'open': qs.filter(status=Ticket.Status.OPEN).count(),
            'in_progress': qs.filter(status=Ticket.Status.IN_PROGRESS).count(),
            'resolved': qs.filter(status=Ticket.Status.RESOLVED).count(),
            'closed': qs.filter(status=Ticket.Status.CLOSED).count(),
            'high_priority': qs.filter(priority=Ticket.Priority.HIGH).count(),
        }
        return Response(data)