from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, PaymentViewSet, AdminDashboardStatsView

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
]