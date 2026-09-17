from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Provides the full CRUD REST API for the Student entity:

        GET    /api/students/        -> list (supports ?search=)
        POST   /api/students/        -> create
        GET    /api/students/{id}/   -> retrieve
        PUT    /api/students/{id}/   -> update
        PATCH  /api/students/{id}/   -> partial update
        DELETE /api/students/{id}/   -> delete
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(course__icontains=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Student deleted successfully."},
            status=status.HTTP_200_OK,
        )
