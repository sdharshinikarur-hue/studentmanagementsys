# Student Management System (CRUD Web App)

A full-stack CRUD application built to the project SOP: HTML/CSS/JavaScript frontend,
Django REST Framework backend, and a SQLite database.

## 1. Overview

Manages student records with full **Create, Read, Update, Delete** functionality,
server-side + client-side validation, search/filter, and a REST API that can be
tested independently with Postman.

## 2. Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Frontend  | HTML, CSS, JavaScript (fetch API)    |
| Backend   | Django + Django REST Framework       |
| Database  | SQLite                               |
| API Test  | Postman                              |

## 3. Project Structure

```
student-management-system/
├── backend/
│   ├── requirements.txt
│   └── studentms/
│       ├── manage.py
│       ├── studentms/          # project settings, urls, wsgi
│       └── students/           # app: models, serializers, views, urls, admin, tests
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## 4. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cd studentms
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/students/`.

## 5. Frontend Setup

No build step required — it's plain HTML/CSS/JS.

```bash
cd frontend
python -m http.server 5500
```

Open `http://127.0.0.1:5500` in your browser. (CORS is enabled on the backend
so the frontend can run on a different port.)

## 6. REST API Reference

| Operation | Method | Endpoint                  |
|-----------|--------|----------------------------|
| Create    | POST   | `/api/students/`           |
| Read all  | GET    | `/api/students/`            |
| Read one  | GET    | `/api/students/{id}/`       |
| Update    | PUT    | `/api/students/{id}/`       |
| Delete    | DELETE | `/api/students/{id}/`       |

Search: `GET /api/students/?search=<term>` matches first name, last name, email, or course.

Example create payload:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "course": "Computer Science",
  "age": 20
}
```

## 7. Running Tests

```bash
cd backend/studentms
python manage.py test
```

## 8. Validation Rules

- All fields required; first/last name and course cannot be blank/whitespace.
- Email must be valid format and unique (checked server-side).
- Age must be between 15 and 100.
- Server-side validation is enforced independently of the frontend checks.

## 9. Notes for Production

- Move `SECRET_KEY` and `DEBUG` into environment variables.
- Replace `CORS_ALLOW_ALL_ORIGINS` with an explicit allow-list.
- Swap SQLite for PostgreSQL/MySQL if deploying beyond local/dev use.
