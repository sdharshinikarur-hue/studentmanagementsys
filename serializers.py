from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "course",
            "age",
            "enrollment_date",
        ]
        read_only_fields = ["id", "enrollment_date"]

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        return value.strip()

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        return value.strip()

    def validate_course(self, value):
        if not value.strip():
            raise serializers.ValidationError("Course cannot be empty.")
        return value.strip()

    def validate_email(self, value):
        # Extra explicit duplicate check for a clear error message,
        # on top of the model's unique=True constraint.
        qs = Student.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A student with this email already exists.")
        return value
