from django.db import models


class Vehicle(models.Model):

    FUEL_CHOICES = [
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
        ('ELECTRIC', 'Electric'),
        ('HYBRID', 'Hybrid'),
    ]

    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    year = models.IntegerField()
    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FUEL_CHOICES
    )
    is_available = models.BooleanField(default=True)
    image = models.ImageField(
        upload_to='vehicles/',
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.year})"