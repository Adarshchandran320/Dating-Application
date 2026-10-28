# HeartSync — Dating Application

A full-stack Dating Application built with Django REST Framework (DRF) secured by JWT authentication on the backend and React (Vite) on the frontend. The application enables users to register, securely authenticate using JSON Web Tokens, create and manage a personal dating profile, browse members, perform multi-criteria searches (by age, gender, hobbies, foods, and movie genres), and explore match recommendations dynamically calculated from overlapping preferences.

---

## 1. Features

- **Email-Based JWT Authentication:** Secure signup, login, and automatic token refresh via `djangorestframework-simplejwt`.
- **One-to-One Profile Ownership:** Each registered user owns strictly one dating profile with complete CRUD operations. Non-owners are forbidden from modifying or deleting others' profiles.
- **Preference Tagging:** Hobbies, favourite foods, and preferred movie genres modelled as Many-to-Many relations, automatically normalised to lowercase with chip-based tag inputs.
- **Multi-Criteria Filtering:** Flexible querying by age range (`min_age`, `max_age`), gender, and tag categories with ANY-within and ALL-across semantics.
- **Intelligent Match Suggestions:** Query-level SQL annotations compute overlap scores across hobbies, foods, and genres, returning candidates ordered by match score while excluding the user's own profile.
- **Responsive Modern UI:** Built with React 18, Vite, React Router v6, Axios interceptors, and a custom CSS glassmorphism design system with full mobile responsiveness (tested at 360px, 768px, and 1280px).

---

## 2. Prerequisites

- **Python:** 3.11 or newer (tested on Python 3.13)
- **Node.js:** v18 or newer (tested on Node.js v24 & npm 11)
- **MySQL Server:** 8.0 or newer (tested on MySQL Community Server 8.4)

---

## 3. Backend Setup

### 3.1 MySQL Database Setup
Open the MySQL shell as a privileged user (`root`) and execute:

```sql
CREATE DATABASE IF NOT EXISTS dating_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'dating_user'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON dating_app_db.* TO 'dating_user'@'localhost';
GRANT ALL PRIVILEGES ON `test_dating_app_db`.* TO 'dating_user'@'localhost';
FLUSH PRIVILEGES;
```

> **Note on `test_dating_app_db`:** Django's test runner automatically provisions and tears down `test_<DB_NAME>`. The second `GRANT` ensures test runs execute without access errors.

### 3.2 Environment Configuration
Navigate to the `backend` directory:

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

Create your `.env` file (copy from `.env.example`):

```ini
SECRET_KEY=django-insecure-dating-app-secret-key-change-in-production-1234567890
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DB_NAME=dating_app_db
DB_USER=dating_user
DB_PASSWORD=change_me
DB_HOST=127.0.0.1
DB_PORT=3306
```

### 3.3 Database Migrations & Seeding
```bash
python manage.py migrate
python manage.py seed_demo
```

### 3.4 Running the Development Server
```bash
python manage.py runserver 127.0.0.1:8000
```

### 3.5 Running Automated Tests
```bash
python manage.py test
```

### Troubleshooting: `mysqlclient` on Windows
If `mysqlclient` encounters compiler errors on Windows:
1. Ensure wheel support is updated: `pip install --upgrade pip setuptools wheel`.
2. Pre-built wheels for Python 3.11–3.13 are available on PyPI and install cleanly without MSVC C++ build tools.
3. If pre-built binaries cannot be used, install `PyMySQL` (`pip install pymysql`) and add the following at the top of `dating_app/__init__.py`:
   ```python
   import pymysql
   pymysql.install_as_MySQLdb()
   ```

---

## 4. Frontend Setup

### 4.1 Installation & Environment
Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install
```

Ensure `frontend/.env` contains:
```ini
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4.2 Running the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4.3 Production Build
```bash
npm run build
```

---

## 5. Demo Credentials

The `python manage.py seed_demo` command generates 10 pre-configured demo users with complete profiles and overlapping preferences:

- **Password for all demo accounts:** `DemoPass#123`
- **Demo Users:**
  1. `demo1@example.com` (Alex Mercer — Software Engineer, 28)
  2. `demo2@example.com` (Elena Rostova — Graphic Designer, 26)
  3. `demo3@example.com` (Jordan Lee — UX Researcher, 31)
  4. `demo4@example.com` (Marcus Vance — Product Manager, 34)
  5. `demo5@example.com` (Sophia Chen — Data Analyst, 24)
  6. `demo6@example.com` (Sam Taylor — Journalist, 29)
  7. `demo7@example.com` (David Miller — Architect, 42)
  8. `demo8@example.com` (Priya Sharma — Marketing Strategist, 27)
  9. `demo9@example.com` (Kai Rivera — Student & Barista, 22)
  10. `demo10@example.com` (Chloe Bennett — Pediatrician, 38)

---

## 6. API Endpoints Contract

| Method | Path | Auth Required | Purpose | Status |
|---|---|---|---|---|
| `POST` | `/api/users/signup/` (also `/api/users/signup`) | None | Register new user | `201 Created` |
| `POST` | `/api/token/` | None | Login, returns access & refresh | `200 OK` |
| `POST` | `/api/token/refresh/` | None | Refresh access token | `200 OK` |
| `GET` | `/api/users/me/` | JWT | Get authenticated user info | `200 OK` |
| `GET` | `/api/clients/` | JWT | List profiles (supports filters) | `200 OK` |
| `POST` | `/api/clients/` | JWT | Create client profile | `201 Created` |
| `GET` | `/api/clients/{id}/` | JWT | Retrieve specific profile | `200 OK` |
| `PUT/PATCH` | `/api/clients/{id}/` | JWT (Owner) | Update specific profile | `200 OK` |
| `DELETE` | `/api/clients/{id}/` | JWT (Owner) | Delete profile | `204 No Content` |
| `GET` | `/api/clients/me/` | JWT | Retrieve own profile | `200 OK` / `404` |
| `GET` | `/api/clients/matches/` | JWT | Get match suggestions | `200 OK` / `404` |
| `GET` | `/api/hobbies/` | JWT | Tag lookup for hobbies | `200 OK` |
| `GET` | `/api/favourite-foods/` | JWT | Tag lookup for foods | `200 OK` |
| `GET` | `/api/movie-genres/` | JWT | Tag lookup for genres | `200 OK` |

### Example Request & Response Payloads

#### 1. User Registration (`POST /api/users/signup/`)
**Request:**
```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "StrongPassword#123",
  "confirm_password": "StrongPassword#123"
}
```
**Response (201 Created):**
```json
{
  "message": "Registration successful.",
  "user": {
    "id": 12,
    "name": "Jordan Lee",
    "email": "jordan@example.com"
  }
}
```

#### 2. User Login (`POST /api/token/`)
**Request:**
```json
{
  "email": "jordan@example.com",
  "password": "StrongPassword#123"
}
```
**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Token Refresh (`POST /api/token/refresh/`)
**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Create Client Profile (`POST /api/clients/`)
**Request Header:** `Authorization: Bearer <access_token>`
```json
{
  "name": "Jordan Lee",
  "age": 28,
  "gender": "non_binary",
  "occupation": "Product Designer",
  "bio": "Avid hiker and board game strategist.",
  "hobbies": ["hiking", "gaming"],
  "favourite_foods": ["ramen", "tacos"],
  "movie_genres": ["sci-fi", "documentary"]
}
```
**Response (201 Created):**
```json
{
  "id": 11,
  "name": "Jordan Lee",
  "age": 28,
  "gender": "non_binary",
  "occupation": "Product Designer",
  "bio": "Avid hiker and board game strategist.",
  "hobbies": ["gaming", "hiking"],
  "favourite_foods": ["ramen", "tacos"],
  "movie_genres": ["documentary", "sci-fi"],
  "owner_name": "Jordan Lee",
  "is_owner": true,
  "created_at": "2026-10-28T06:05:00.000000Z",
  "updated_at": "2026-10-28T06:05:00.000000Z"
}
```

#### 5. Filter Profiles (`GET /api/clients/?min_age=25&max_age=35&gender=female&hobbies=photography`)
**Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Elena Rostova",
    "age": 26,
    "gender": "female",
    "occupation": "Graphic Designer",
    "bio": "Illustrator by day, indie film buff by night.",
    "hobbies": ["painting", "photography", "reading", "yoga"],
    "favourite_foods": ["ramen", "salad", "tacos"],
    "movie_genres": ["animation", "romance", "sci-fi"],
    "owner_name": "Elena Rostova",
    "is_owner": false,
    "created_at": "2026-10-28T05:58:14.000000Z",
    "updated_at": "2026-10-28T05:58:14.000000Z"
  }
]
```

#### 6. Match Suggestions (`GET /api/clients/matches/`)
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Alex Mercer",
    "age": 28,
    "gender": "male",
    "occupation": "Software Engineer",
    "bio": "Passionate about open source and hiking.",
    "hobbies": ["coding", "gaming", "hiking", "photography"],
    "favourite_foods": ["pizza", "sushi", "tacos"],
    "movie_genres": ["action", "sci-fi", "thriller"],
    "owner_name": "Alex Mercer",
    "is_owner": false,
    "created_at": "2026-10-28T05:58:14.000000Z",
    "updated_at": "2026-10-28T05:58:14.000000Z",
    "common_hobbies": ["gaming", "hiking"],
    "common_favourite_foods": ["tacos"],
    "common_movie_genres": ["sci-fi"],
    "match_score": 4
  }
]
```

---

## 7. Database Diagram and Relationships

```
┌─────────────────────┐
│    accounts_user    │
├─────────────────────┤
│ id (PK)             │
│ email (UQ)          │
│ name                │
│ password            │
│ is_staff            │
│ is_active           │
└──────────┬──────────┘
           │ 1
           │
           │ 1
┌──────────┴──────────┐       M ┌───────────────┐ N       ┌─────────────────┐
│ clients_clientprofile│─────────┤ clients_m2m   ├─────────│ clients_hobby   │
├─────────────────────┤         └───────────────┘         ├─────────────────┤
│ id (PK)             │                                   │ id (PK)         │
│ user_id (FK, UQ)    │       M ┌───────────────┐ N       │ name (UQ)       │
│ name                │─────────┤ clients_m2m   ├─────────└─────────────────┘
│ age                 │         └───────────────┘         ┌─────────────────┐
│ gender              │                                   │ favourite_food  │
│ occupation          │       M ┌───────────────┐ N       ├─────────────────┤
│ bio                 │─────────┤ clients_m2m   ├─────────│ id (PK)         │
│ created_at          │         └───────────────┘         │ name (UQ)       │
│ updated_at          │                                   └─────────────────┘
└─────────────────────┘                                   ┌─────────────────┐
                                                          │ movie_genre     │
                                                          ├─────────────────┤
                                                          │ id (PK)         │
                                                          │ name (UQ)       │
                                                          └─────────────────┘
```

- **User 1—1 ClientProfile:** `ClientProfile.user` is a `OneToOneField` linking to `accounts.User`.
- **ClientProfile M—N Tags:** `hobbies`, `favourite_foods`, and `movie_genres` are each Many-to-Many relationships to normalised tag tables (`Hobby`, `FavouriteFood`, `MovieGenre`).

---

## 8. Design Decisions and Assumptions

1. **MySQL 8.x with `utf8mb4`:** Configured strictly with `django.db.backends.mysql` and utf8mb4 encoding; SQLite is not present anywhere in configuration or fallbacks.
2. **Email-Based Authentication:** Standard simplejwt `TokenObtainPairView` is used directly because the custom `User` model defines `USERNAME_FIELD = "email"` without a username column.
3. **One Profile Per User:** If an authenticated user calls `POST /api/clients/` when they already own a profile, the API returns HTTP 400 with `{"detail": "You already have a profile.", "profile_id": <id>}`.
4. **Lowercase Normalised Tags:** All tags (`Hobby`, `FavouriteFood`, `MovieGenre`) are stripped and saved lowercase. The API accepts and outputs simple JSON lists of strings.
5. **Filter Semantics:** Multi-value filters for tags match with `ANY` (e.g. `hobbies=hiking,reading` matches any profile with either hobby), while filters across distinct categories match with `AND`. `.distinct()` prevents duplicated rows from relational joins.
6. **Matching Score Definition:** The match score is the sum of shared hobbies, shared foods, and shared movie genres calculated via SQL `Count` with `filter=Q(...)`. Candidates with a match score of 0 and the requester's own profile are excluded.
7. **Pagination:** Disabled (`pagination_class = None`) for the timed machine test, but frontend list handlers accept both array and `{ results: [] }` structures.
8. **Tolerant URLs:** `/api/users/signup` is mapped with regex `r"^users/signup/?$"` to handle requests with or without trailing slashes without redirect errors.

---

## 9. Security Notes

- **JWT Lifetimes:** Configured with a 15-minute access token lifetime and a 7-day refresh token lifetime.
- **Token Storage Trade-off:** As required by the test specification, tokens are stored in browser `localStorage`. In a high-risk enterprise environment, storing refresh tokens in `HttpOnly` Secure SameSite cookies is recommended to mitigate Cross-Site Scripting (XSS).
- **CORS Restricted:** Cross-Origin Resource Sharing is locked down to configured origins (default `http://localhost:5173` and `http://127.0.0.1:5173`) and never allows wildcard origins (`*`).
- **Authorization Enforcement:** DRF has global `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`. Only signup, token obtain, and token refresh are public.

---

## 10. Known Limitations

- **Image Uploads:** Avatars / profile pictures are not part of the required specification and were omitted in compliance with Rule 3.
- **Real-Time Chat:** Messaging/chat websockets are not part of this specification and can be integrated via Django Channels.
