from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):

    queryset = Booking.objects.all().order_by('-created_at')

    serializer_class = BookingSerializer

    permission_classes = [AllowAny]

    http_method_names = [
        'get',
        'post',
        'head',
        'options',
    ]

    def perform_create(self, serializer):

        vehicle = serializer.validated_data['vehicle']

        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']

        days = (end_date - start_date).days + 1

        if days < 1:
            days = 1

        total_amount = (
            days * vehicle.price_per_day
        )

        user = (
            self.request.user
            if self.request.user.is_authenticated
            else None
        )

        serializer.save(
            user=user,
            total_amount=total_amount,
        )

    @action(
        detail=True,
        methods=['post']
    )
    def cancel(self, request, pk=None):

        booking = self.get_object()

        if booking.status == 'Cancelled':

            return Response(
                {
                    'detail':
                    'This booking is already cancelled.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = 'Cancelled'

        booking.save(
            update_fields=['status']
        )

        vehicle = booking.vehicle

        vehicle.is_available = True

        vehicle.save(
            update_fields=['is_available']
        )

        serializer = self.get_serializer(
            booking
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )