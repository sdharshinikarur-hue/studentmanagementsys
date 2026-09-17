from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Student


class StudentCRUDTests(APITestCase):
    def setUp(self):
        self.student = Student.objects.create(
            first_name="Jane",
            last_name="Doe",
            email="jane.doe@example.com",
            course="Computer Science",
            age=20,
        )
        self.list_url = "/api/students/"
        self.detail_url = f"/api/students/{self.student.id}/"

    def test_create_student(self):
        payload = {
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@example.com",
            "course": "Data Science",
            "age": 22,
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 2)

    def test_create_duplicate_email_fails(self):
        payload = {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": "jane.doe@example.com",
            "course": "Data Science",
            "age": 22,
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_students(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_student(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "jane.doe@example.com")

    def test_update_student(self):
        response = self.client.patch(self.detail_url, {"course": "Cybersecurity"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.course, "Cybersecurity")

    def test_delete_student(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Student.objects.count(), 0)

    def test_retrieve_invalid_id_returns_404(self):
        response = self.client.get("/api/students/9999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
