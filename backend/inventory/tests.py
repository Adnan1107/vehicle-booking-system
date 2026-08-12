from datetime import date, timedelta

from django.test import TestCase
from rest_framework.test import APIClient


class BookingAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()
        from .models import Vehicle
        self.vehicle = Vehicle.objects.create(
            name='Fortuner',
            brand='Toyota',
            year=2023,
            price_per_day=3000,
            fuel_type='DIESEL',
        )

    def test_create_booking_success(self):
        payload = {
            'vehicle': self.vehicle.id,
            'customer_name': 'Harshad',
            'customer_phone': '9876543210',
            'start_date': str(date.today() + timedelta(days=1)),
            'end_date': str(date.today() + timedelta(days=4)),
        }
        response = self.client.post('/api/bookings/', payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['total_amount'], '9000.00')

    def test_overlapping_booking_rejected(self):
        payload = {
            'vehicle': self.vehicle.id,
            'customer_name': 'Harshad',
            'customer_phone': '9876543210',
            'start_date': str(date.today() + timedelta(days=1)),
            'end_date': str(date.today() + timedelta(days=4)),
        }
        self.client.post('/api/bookings/', payload)

        # Free the vehicle again so we're testing the overlap rule specifically,
        # not the "unavailable vehicle" rule.
        from .models import Vehicle
        Vehicle.objects.filter(id=self.vehicle.id).update(is_available=True)

        overlap_payload = dict(payload, customer_name='Another Customer')
        response = self.client.post('/api/bookings/', overlap_payload)
        self.assertEqual(response.status_code, 400)

    def test_invalid_phone_rejected(self):
        payload = {
            'vehicle': self.vehicle.id,
            'customer_name': 'Harshad',
            'customer_phone': '12345',
            'start_date': str(date.today() + timedelta(days=1)),
            'end_date': str(date.today() + timedelta(days=4)),
        }
        response = self.client.post('/api/bookings/', payload)
        self.assertEqual(response.status_code, 400)

    def test_past_start_date_rejected(self):
        payload = {
            'vehicle': self.vehicle.id,
            'customer_name': 'Harshad',
            'customer_phone': '9876543210',
            'start_date': str(date.today() - timedelta(days=1)),
            'end_date': str(date.today() + timedelta(days=4)),
        }
        response = self.client.post('/api/bookings/', payload)
        self.assertEqual(response.status_code, 400)