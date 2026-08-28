from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """only admin (is_staff) can access."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)