from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import VehicleViewSet, login_view, register_view


router = DefaultRouter()

router.register(
    'vehicles',
    VehicleViewSet,
    basename='vehicle'
)


urlpatterns = [
    path(
        'auth/register/',
        register_view,
        name='register'
    ),

    path(
        'auth/login/',
        login_view,
        name='login'
    ),

    path(
        '',
        include(router.urls)
    ),
]