from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer
from customers.serializers import CustomerSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        return Response(
            {"detail": "Registration successful", "customer": CustomerSerializer(customer).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        role = 'admin' if user.is_staff else 'customer'
        customer_id = None
        if hasattr(user, 'customer_profile'):
            customer_id = user.customer_profile.id

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": role,
            "customer_id": customer_id,
            "username": user.username,
        })