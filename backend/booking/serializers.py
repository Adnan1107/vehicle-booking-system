from datetime import date

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Booking, Payment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class BookingSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_brand = serializers.CharField(source='vehicle.brand', read_only=True)
    price_per_day = serializers.DecimalField(
        source='vehicle.price_per_day', max_digits=10, decimal_places=2, read_only=True
    )
    num_days = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_brand', 'price_per_day',
            'customer_name', 'customer_email', 'customer_phone',
            'start_date', 'end_date', 'num_days',
            'total_amount', 'status', 'created_at', 'updated_at', 'cancelled_at',
        ]
        # total_amount and status are NEVER accepted from the client (req. #7, #16).
        # The backend is the only place that computes price or moves status.
        read_only_fields = [
            'id', 'total_amount', 'status', 'created_at', 'updated_at', 'cancelled_at',
        ]

    def get_num_days(self, obj):
        return max((obj.end_date - obj.start_date).days, 1)

    def validate_customer_phone(self, value):
        digits = value.strip()
        if not digits.isdigit() or len(digits) != 10:
            raise serializers.ValidationError('Enter a valid 10-digit phone number.')
        return digits

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        vehicle = data.get('vehicle')

        if start and start < date.today():
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be in the past.'
            })

        if start and end and end <= start:
            raise serializers.ValidationError({
                'end_date': 'End date must be after the start date.'
            })

        if vehicle and not vehicle.is_available:
            raise serializers.ValidationError({
                'vehicle': 'This vehicle is not currently available.'
            })

        # Overlap check. The view wraps creation in a transaction with
        # select_for_update() on this same queryset to close the race
        # window between this check and the actual insert.
        if vehicle and start and end:
            overlapping = Booking.objects.filter(
                vehicle=vehicle,
                status__in=Booking.ACTIVE_STATUSES,
                start_date__lt=end,
                end_date__gt=start,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
            if overlapping.exists():
                raise serializers.ValidationError({
                    'vehicle': 'This vehicle is already booked for part of the selected dates.'
                })

        return data


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking_id', 'amount', 'currency', 'method',
            'status', 'gateway_reference', 'created_at', 'updated_at',
        ]
        # Every field here is server-derived. The frontend can never set
        # status/amount directly — that would let a user "pay" for free.
        read_only_fields = fields