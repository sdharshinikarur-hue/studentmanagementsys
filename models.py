from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Student(models.Model):
    """Core entity for the Student Management System (CRUD target)."""

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=100)
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(15), MaxValueValidator(100)]
    )
    enrollment_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ["-enrollment_date", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
