from django.urls import path
from .views import CustomerListCreateView, CustomerDetailView, CustomerTicketsListView

urlpatterns = [
    path('', CustomerListCreateView.as_view(), name='customer-list-create'),
    path('<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('<int:pk>/tickets/', CustomerTicketsListView.as_view(), name='customer-tickets'),
]