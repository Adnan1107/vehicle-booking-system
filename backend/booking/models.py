from django.db import models
from django.contrib.auth.models import User
from inventory.models import Vehicle


class Booking(models.Model):

    # Professional booking lifecycle (req. #8).
    # NOTE: values changed from the old ('Pending','Confirmed','Cancelled','Completed')
    # to explicit upper-case codes. If you have existing rows, write a data migration
    # to map: Pending -> PENDING_PAYMENT, Confirmed -> CONFIRMED,
    # Cancelled -> CANCELLED, Completed -> COMPLETED.
    STATUS_PENDING_PAYMENT = 'PENDING_PAYMENT'
    STATUS_CONFIRMED = 'CONFIRMED'
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_PAYMENT_FAILED = 'PAYMENT_FAILED'

    STATUS_CHOICES = [
        (STATUS_PENDING_PAYMENT, 'Pending Payment'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_PAYMENT_FAILED, 'Payment Failed'),
    ]

    # Statuses that still "hold" a vehicle for date-overlap purposes.
    ACTIVE_STATUSES = [
        STATUS_PENDING_PAYMENT,
        STATUS_CONFIRMED,
        STATUS_ACTIVE,
    ]

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True,
        blank=True
    )

    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=15)

    start_date = models.DateField()
    end_date = models.DateField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING_PAYMENT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['vehicle', 'start_date', 'end_date']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.customer_name} - {self.vehicle} ({self.status})"


class Payment(models.Model):
    """
    Payment abstraction (req. #10).

    This is intentionally gateway-agnostic: `method` and `gateway_reference`
    are the seam where Razorpay/Stripe would plug in later. Until real
    credentials exist, `method='DEMO'` is used and the UI must label it
    "Demo Payment" — never claim a real charge occurred.
    """

    STATUS_PENDING = 'PENDING'
    STATUS_PROCESSING = 'PROCESSING'
    STATUS_PAID = 'PAID'
    STATUS_FAILED = 'FAILED'
    STATUS_REFUNDED = 'REFUNDED'
    STATUS_PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
        (STATUS_PARTIALLY_REFUNDED, 'Partially Refunded'),
    ]

    METHOD_DEMO = 'DEMO'
    METHOD_CHOICES = [
        (METHOD_DEMO, 'Demo Payment'),
        ('CARD', 'Card'),
        ('UPI', 'UPI'),
        ('NETBANKING', 'Net Banking'),
    ]

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='payment'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')

    method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default=METHOD_DEMO,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    # Where a real gateway's transaction/order ID would be stored.
    gateway_reference = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment #{self.id} for Booking #{self.booking_id} ({self.status})"