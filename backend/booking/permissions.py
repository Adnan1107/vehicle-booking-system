from rest_framework.permissions import BasePermission


class IsAdminOrOwner(BasePermission):
    """
    Admin:
        - Full access to all bookings

    Customer:
        - Can view their own bookings
        - Can create bookings
        - Cannot edit/delete bookings
    """

    def has_permission(self, request, view):

        # User must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin has full access
        if request.user.is_staff:
            return True

        # Customer can access list/retrieve/create
        if request.method in ['GET', 'POST']:
            return True

        # Customer cannot PUT/PATCH/DELETE
        return False

    def has_object_permission(self, request, view, obj):

        # Admin can access everything
        if request.user.is_staff:
            return True

        # Customer can only view their own booking
        if request.method == 'GET':
            return obj.user == request.user

        # Customer cannot modify/delete
        return False