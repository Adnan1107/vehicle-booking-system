from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrOwner(BasePermission):
    """
    Admin:
        - Full access to all bookings.

    Customer:
        - Can list/create bookings (list is filtered to their own in the
          viewset's get_queryset — this permission alone does not filter
          querysets, it only gates individual object access).
        - Can view/cancel only their own booking.
        - Cannot PUT/PATCH/DELETE at all (cancellation goes through the
          dedicated `cancel` action instead).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        if request.method in ('GET', 'POST'):
            return True

        # Plain PUT/PATCH/DELETE on the booking resource is blocked for
        # everyone but staff. Cancellation uses the separate `cancel` action.
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method in SAFE_METHODS:
            return obj.user_id == request.user.id

        # Non-safe object-level access (e.g. the `cancel` action) is also
        # owner-only unless staff.
        return obj.user_id == request.user.id