from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Booking


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
        ]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        return user


class BookingSerializer(serializers.ModelSerializer):

    vehicle_name = serializers.CharField(
        source='vehicle.name',
        read_only=True
    )

    vehicle_brand = serializers.CharField(
        source='vehicle.brand',
        read_only=True
    )

    class Meta:
        model = Booking

        fields = [
            'id',
            'vehicle',
            'vehicle_name',
            'vehicle_brand',
            'customer_name',
            'customer_email',
            'customer_phone',
            'start_date',
            'end_date',
            'total_amount',
            'status',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'total_amount',
            'status',
            'created_at',
        ]

    def validate(self, data):

        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError({
                'end_date':
                'End date must be after or equal to start date.'
            })

        return data

    def create(self, validated_data):

        vehicle = validated_data['vehicle']

        start = validated_data['start_date']
        end = validated_data['end_date']

        days = (end - start).days

        if days < 1:
            days = 1

        validated_data['total_amount'] = (
            vehicle.price_per_day * days
        )

        return super().create(validated_data)