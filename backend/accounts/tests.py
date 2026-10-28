from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AccountsAPITests(APITestCase):
    def setUp(self):
        self.signup_url = "/api/users/signup/"
        self.signup_no_slash_url = "/api/users/signup"
        self.token_url = "/api/token/"
        self.refresh_url = "/api/token/refresh/"
        self.me_url = "/api/users/me/"

        self.valid_user_data = {
            "name": "Alice Green",
            "email": "alice@example.com",
            "password": "StrongPassword#123",
            "confirm_password": "StrongPassword#123",
        }

    def test_1_registration_succeeds_with_valid_data(self):
        response = self.client.post(self.signup_url, self.valid_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Registration successful.")
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "alice@example.com")
        self.assertEqual(response.data["user"]["name"], "Alice Green")
        self.assertNotIn("password", response.data["user"])

        # Verify tolerating missing trailing slash
        response_no_slash = self.client.post(
            self.signup_no_slash_url,
            {
                "name": "Bob Green",
                "email": "bob@example.com",
                "password": "StrongPassword#123",
                "confirm_password": "StrongPassword#123",
            },
            format="json",
        )
        self.assertEqual(response_no_slash.status_code, status.HTTP_201_CREATED)

    def test_2_registration_validation_failures(self):
        # Mismatched passwords
        data = self.valid_user_data.copy()
        data["confirm_password"] = "DifferentPassword#123"
        res = self.client.post(self.signup_url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", res.data)

        # Duplicate email
        self.client.post(self.signup_url, self.valid_user_data, format="json")
        dup_res = self.client.post(self.signup_url, self.valid_user_data, format="json")
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", dup_res.data)

        # Weak password (less than 8 chars or too common)
        weak_data = self.valid_user_data.copy()
        weak_data["email"] = "weak@example.com"
        weak_data["password"] = "123"
        weak_data["confirm_password"] = "123"
        weak_res = self.client.post(self.signup_url, weak_data, format="json")
        self.assertEqual(weak_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", weak_res.data)

        # Missing fields
        missing_res = self.client.post(self.signup_url, {}, format="json")
        self.assertEqual(missing_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_3_login_and_invalid_password(self):
        self.client.post(self.signup_url, self.valid_user_data, format="json")

        # Successful login
        res = self.client.post(
            self.token_url,
            {"email": "alice@example.com", "password": "StrongPassword#123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

        # Wrong password
        bad_res = self.client.post(
            self.token_url,
            {"email": "alice@example.com", "password": "WrongPassword"},
            format="json",
        )
        self.assertEqual(bad_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_4_token_refresh(self):
        self.client.post(self.signup_url, self.valid_user_data, format="json")
        login_res = self.client.post(
            self.token_url,
            {"email": "alice@example.com", "password": "StrongPassword#123"},
            format="json",
        )
        refresh_token = login_res.data["refresh"]

        # Valid refresh
        ref_res = self.client.post(
            self.refresh_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(ref_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", ref_res.data)

        # Invalid refresh
        bad_ref = self.client.post(
            self.refresh_url, {"refresh": "invalid.jwt.token"}, format="json"
        )
        self.assertEqual(bad_ref.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_5_users_me_authenticated_and_unauthenticated(self):
        # Unauthenticated
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated
        self.client.post(self.signup_url, self.valid_user_data, format="json")
        login_res = self.client.post(
            self.token_url,
            {"email": "alice@example.com", "password": "StrongPassword#123"},
            format="json",
        )
        access_token = login_res.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        auth_res = self.client.get(self.me_url)
        self.assertEqual(auth_res.status_code, status.HTTP_200_OK)
        self.assertEqual(auth_res.data["email"], "alice@example.com")
        self.assertEqual(auth_res.data["name"], "Alice Green")
        self.assertIsNone(auth_res.data["profile_id"])
