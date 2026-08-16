from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Sum

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Payment
from .permissions import IsAdminOrOwner
from .serializers import BookingSerializer, PaymentSerializer

from inventory.models import Vehicle


class BookingViewSet(viewsets.ModelViewSet):
    """
    IMPORTANT: this used to be permission_classes = [AllowAny], which meant
    GET /api/bookings/ leaked every customer's name/email/phone to anyone,
    logged in or not. Fixed to require auth + ownership.
    """

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = Booking.objects.select_related('vehicle', 'user').order_by('-created_at')
        user = self.request.user
        if user.is_staff:
            return qs
        # Non-staff users only ever see their own bookings (req. #2, #16).
        return qs.filter(user=user)

    def perform_create(self, serializer):
        vehicle = serializer.validated_data['vehicle']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']

        days = max((end_date - start_date).days, 1)
        # Backend computes the price — the frontend's number is never trusted (req. #7, #16).
        total_amount = days * vehicle.price_per_day

        with transaction.atomic():
            # Lock any potentially-overlapping rows for this vehicle so a second
            # concurrent request can't slip past the serializer's overlap check
            # before this one commits (req. #7 — race condition handling).
            (
                Booking.objects
                .select_for_update()
                .filter(
                    vehicle=vehicle,
                    status__in=Booking.ACTIVE_STATUSES,
                    start_date__lt=end_date,
                    end_date__gt=start_date,
                )
            )

            still_overlapping = Booking.objects.filter(
                vehicle=vehicle,
                status__in=Booking.ACTIVE_STATUSES,
                start_date__lt=end_date,
                end_date__gt=start_date,
            ).exists()

            if still_overlapping:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'vehicle': 'This vehicle was just booked for overlapping dates. Please choose different dates.'
                })

            booking = serializer.save(
                user=self.request.user,
                total_amount=total_amount,
                status=Booking.STATUS_PENDING_PAYMENT,
            )

            # Every booking gets a Payment record immediately, in PENDING
            # state. The booking is NOT "Confirmed" until this Payment
            # transitions to PAID via /api/payments/<id>/pay/.
            Payment.objects.create(
                booking=booking,
                user=self.request.user,
                amount=total_amount,
                status=Payment.STATUS_PENDING,
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()  # has_object_permission enforces ownership

        if booking.status == Booking.STATUS_CANCELLED:
            return Response(
                {'detail': 'This booking is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status in (Booking.STATUS_COMPLETED,):
            return Response(
                {'detail': 'A completed booking cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Configurable cancellation rule (req. #9): only before the rental starts.
        if booking.start_date <= timezone.localdate():
            return Response(
                {'detail': 'This booking can no longer be cancelled — the rental period has started.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            booking.status = Booking.STATUS_CANCELLED
            booking.cancelled_at = timezone.now()
            booking.save(update_fields=['status', 'cancelled_at', 'updated_at'])

            payment = getattr(booking, 'payment', None)
            if payment and payment.status == Payment.STATUS_PAID:
                payment.status = Payment.STATUS_REFUNDED
                payment.save(update_fields=['status', 'updated_at'])
            elif payment and payment.status == Payment.STATUS_PENDING:
                payment.status = Payment.STATUS_FAILED
                payment.save(update_fields=['status', 'updated_at'])

            # Only release the vehicle if no other active booking still needs it.
            still_has_active_booking = Booking.objects.filter(
                vehicle=booking.vehicle,
                status__in=Booking.ACTIVE_STATUSES,
            ).exclude(pk=booking.pk).exists()

            if not still_has_active_booking:
                booking.vehicle.is_available = True
                booking.vehicle.save(update_fields=['is_available'])

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='set-status')
    def set_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        booking = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = dict(Booking.STATUS_CHOICES)

        if new_status not in valid_statuses:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status in (Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED) and new_status != booking.status:
            return Response(
                {'detail': f'Cannot change the status of a {valid_statuses[booking.status].lower()} booking.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            booking.status = new_status
            if new_status == Booking.STATUS_CANCELLED:
                booking.cancelled_at = timezone.now()
            booking.save(update_fields=['status', 'cancelled_at', 'updated_at'])

            if new_status in (Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED):
                still_active = Booking.objects.filter(
                    vehicle=booking.vehicle, status__in=Booking.ACTIVE_STATUSES
                ).exclude(pk=booking.pk).exists()
                if not still_active:
                    booking.vehicle.is_available = True
                    booking.vehicle.save(update_fields=['is_available'])

        return Response(self.get_serializer(booking).data)
    


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only by default; the only way to move money is the explicit `pay`
    action below, which is a labeled Demo Payment — never a fabricated
    "success" flipped on by the frontend alone.
    """

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        qs = Payment.objects.select_related('booking', 'user').order_by('-created_at')
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """
        DEMO payment flow. This intentionally does NOT contact a real
        gateway (no credentials configured). It exists so the booking
        lifecycle (Pending Payment -> Confirmed) is real and testable,
        while making it unmistakable to the user that no real money moved.

        To wire in Razorpay/Stripe later: replace the body of this method
        with a call to the gateway's order/charge API, verify its signature,
        and set status/gateway_reference from the verified response —
        the Booking/Payment state machine below does not need to change.
        """
        payment = self.get_object()

        if payment.status == Payment.STATUS_PAID:
            return Response({'detail': 'This payment has already been completed.'}, status=400)

        if payment.booking.status == Booking.STATUS_CANCELLED:
            return Response({'detail': 'Cannot pay for a cancelled booking.'}, status=400)

        with transaction.atomic():
            payment.status = Payment.STATUS_PAID
            payment.method = Payment.METHOD_DEMO
            payment.gateway_reference = f'DEMO-{payment.id}-{int(timezone.now().timestamp())}'
            payment.save(update_fields=['status', 'method', 'gateway_reference', 'updated_at'])

            booking = payment.booking
            booking.status = Booking.STATUS_CONFIRMED
            booking.save(update_fields=['status', 'updated_at'])

            booking.vehicle.is_available = False
            booking.vehicle.save(update_fields=['is_available'])

        return Response(
            {
                'detail': 'Demo Payment successful. No real charge was made.',
                'payment': PaymentSerializer(payment).data,
            },
            status=200,
        )
        
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        bookings = Booking.objects.all()

        revenue = Payment.objects.filter(status=Payment.STATUS_PAID).aggregate(
            total=Sum('amount')
        )['total'] or 0

        recent = bookings.select_related('vehicle').order_by('-created_at')[:5]

        return Response({
            'total_users': User.objects.count(),
            'total_vehicles': Vehicle.objects.count(),
            'total_bookings': bookings.count(),
            'confirmed_bookings': bookings.filter(
                status__in=[Booking.STATUS_CONFIRMED, Booking.STATUS_ACTIVE]
            ).count(),
            'pending_bookings': bookings.filter(status=Booking.STATUS_PENDING_PAYMENT).count(),
            'cancelled_bookings': bookings.filter(status=Booking.STATUS_CANCELLED).count(),
            'completed_bookings': bookings.filter(status=Booking.STATUS_COMPLETED).count(),
            'total_revenue': revenue,
            'pending_payments': Payment.objects.filter(status=Payment.STATUS_PENDING).count(),
            'recent_bookings': BookingSerializer(recent, many=True).data,
        })