from django.contrib import admin

from .models import Booking, Payment


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'customer_name', 'customer_email', 'customer_phone',
        'vehicle', 'start_date', 'end_date', 'total_amount', 'status', 'created_at',
    )
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'vehicle__name', 'vehicle__brand')
    readonly_fields = ('total_amount', 'created_at', 'updated_at', 'cancelled_at')
    ordering = ('-created_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'user', 'amount', 'currency', 'method', 'status', 'created_at')
    list_filter = ('status', 'method')
    search_fields = ('booking__customer_name', 'gateway_reference')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)