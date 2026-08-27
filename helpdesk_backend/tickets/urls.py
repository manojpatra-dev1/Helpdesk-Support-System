from django.urls import path
from .views import (
    TicketListCreateView, TicketDetailView, TicketChangeStatusView,
    CommentCreateView, TicketHistoryListView, DashboardStatsView
)

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('dashboard/', DashboardStatsView.as_view(), name='ticket-dashboard'),
    path('<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:pk>/change-status/', TicketChangeStatusView.as_view(), name='ticket-change-status'),
    path('<int:pk>/add-comment/', CommentCreateView.as_view(), name='ticket-add-comment'),
    path('<int:pk>/history/', TicketHistoryListView.as_view(), name='ticket-history'),
]