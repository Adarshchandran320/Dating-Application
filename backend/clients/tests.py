from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from clients.models import ClientProfile, Hobby, FavouriteFood, MovieGenre

User = get_user_model()


class ClientsAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="u1@example.com", password="Password#123", name="User One"
        )
        self.user2 = User.objects.create_user(
            email="u2@example.com", password="Password#123", name="User Two"
        )

        # Generate tokens
        res1 = self.client.post(
            "/api/token/",
            {"email": "u1@example.com", "password": "Password#123"},
            format="json",
        )
        self.token1 = res1.data["access"]

        res2 = self.client.post(
            "/api/token/",
            {"email": "u2@example.com", "password": "Password#123"},
            format="json",
        )
        self.token2 = res2.data["access"]

        self.profile1_data = {
            "name": "User One Profile",
            "age": 25,
            "gender": "female",
            "occupation": "Photographer",
            "bio": "Loves photography and hiking",
            "hobbies": ["photography", "hiking"],
            "favourite_foods": ["sushi", "tacos"],
            "movie_genres": ["drama", "comedy"],
        }

    def test_6_unauthenticated_requests_return_401(self):
        self.assertEqual(self.client.get("/api/clients/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post("/api/clients/", {}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get("/api/clients/1/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.patch("/api/clients/1/", {}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.delete("/api/clients/1/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get("/api/clients/me/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get("/api/clients/matches/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_7_create_profile_attaches_user_and_returns_tag_arrays(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        res = self.client.post("/api/clients/", self.profile1_data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["name"], "User One Profile")
        self.assertEqual(res.data["owner_name"], "User One")
        self.assertTrue(res.data["is_owner"])
        self.assertEqual(res.data["hobbies"], ["hiking", "photography"])
        self.assertEqual(res.data["favourite_foods"], ["sushi", "tacos"])
        self.assertEqual(res.data["movie_genres"], ["comedy", "drama"])

        # Check me endpoint now returns it
        me_res = self.client.get("/api/clients/me/")
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data["id"], res.data["id"])

    def test_8_cannot_create_second_profile_for_same_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        res1 = self.client.post("/api/clients/", self.profile1_data, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        res2 = self.client.post("/api/clients/", self.profile1_data, format="json")
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", res2.data)
        self.assertEqual(str(res2.data["detail"]), "You already have a profile.")
        self.assertEqual(int(res2.data["profile_id"]), res1.data["id"])


    def test_9_non_owner_forbidden_to_modify_other_profile_but_can_read(self):
        # User 1 creates profile
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        create_res = self.client.post("/api/clients/", self.profile1_data, format="json")
        profile_id = create_res.data["id"]

        # User 2 logs in
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2}")

        # Can read
        get_res = self.client.get(f"/api/clients/{profile_id}/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertFalse(get_res.data["is_owner"])

        # Cannot PUT
        put_res = self.client.put(
            f"/api/clients/{profile_id}/",
            {
                "name": "Hacked Name",
                "age": 30,
                "gender": "male",
                "occupation": "Hacker",
                "hobbies": ["hacking"],
                "favourite_foods": ["fastfood"],
                "movie_genres": ["action"],
            },
            format="json",
        )
        self.assertEqual(put_res.status_code, status.HTTP_403_FORBIDDEN)

        # Cannot PATCH
        patch_res = self.client.patch(
            f"/api/clients/{profile_id}/", {"occupation": "Hacker"}, format="json"
        )
        self.assertEqual(patch_res.status_code, status.HTTP_403_FORBIDDEN)

        # Cannot DELETE
        del_res = self.client.delete(f"/api/clients/{profile_id}/")
        self.assertEqual(del_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_10_owner_can_patch_without_losing_tags_and_can_delete(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        create_res = self.client.post("/api/clients/", self.profile1_data, format="json")
        profile_id = create_res.data["id"]

        # Partial update scalar field
        patch_res = self.client.patch(
            f"/api/clients/{profile_id}/", {"occupation": "Senior Photographer"}, format="json"
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["occupation"], "Senior Photographer")
        # Ensure tags are retained
        self.assertEqual(patch_res.data["hobbies"], ["hiking", "photography"])

        # Delete
        del_res = self.client.delete(f"/api/clients/{profile_id}/")
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

        # Verify gone
        get_res = self.client.get(f"/api/clients/{profile_id}/")
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_11_sending_user_in_body_is_ignored(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        data = self.profile1_data.copy()
        data["user"] = self.user2.id
        create_res = self.client.post("/api/clients/", data, format="json")
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        profile = ClientProfile.objects.get(id=create_res.data["id"])
        self.assertEqual(profile.user_id, self.user1.id)
        self.assertNotEqual(profile.user_id, self.user2.id)

    def test_12_filtering_scenarios(self):
        # Create profiles with varied properties
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        self.client.post("/api/clients/", self.profile1_data, format="json")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2}")
        self.client.post(
            "/api/clients/",
            {
                "name": "User Two Profile",
                "age": 35,
                "gender": "male",
                "occupation": "Developer",
                "hobbies": ["gaming", "hiking"],
                "favourite_foods": ["ramen"],
                "movie_genres": ["sci-fi"],
            },
            format="json",
        )

        # Age filter: min_age=30 -> only user2
        res = self.client.get("/api/clients/?min_age=30")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["name"], "User Two Profile")

        # Gender filter: gender=female -> only user1
        res = self.client.get("/api/clients/?gender=female")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["name"], "User One Profile")

        # Tag filter: hobbies=photography -> only user1
        res = self.client.get("/api/clients/?hobbies=photography")
        self.assertEqual(len(res.data), 1)

        # Tag filter match ANY: hobbies=photography,gaming -> both
        res = self.client.get("/api/clients/?hobbies=photography,gaming")
        self.assertEqual(len(res.data), 2)

        # Combined filter
        res = self.client.get("/api/clients/?min_age=20&max_age=30&gender=female&hobbies=hiking")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["name"], "User One Profile")

        # Blank parameters request
        res = self.client.get("/api/clients/?min_age=&max_age=&gender=&hobbies=")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        # Invalid min_age > max_age -> 400
        res = self.client.get("/api/clients/?min_age=40&max_age=20")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_13_matches_logic_and_edge_cases(self):
        # No profile case -> 404
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        res = self.client.get("/api/clients/matches/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.data["detail"], "Create a profile to see matches.")

        # Create user 1 profile (hobbies: photography, hiking; foods: sushi, tacos; genres: drama, comedy)
        self.client.post("/api/clients/", self.profile1_data, format="json")

        # User 2 creates profile with partial overlap (hiking, sushi) -> score 2
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2}")
        self.client.post(
            "/api/clients/",
            {
                "name": "User Two Profile",
                "age": 30,
                "gender": "male",
                "occupation": "Chef",
                "hobbies": ["hiking", "cycling"],
                "favourite_foods": ["sushi", "pizza"],
                "movie_genres": ["action"],
            },
            format="json",
        )

        # User 3 creates profile with zero overlap
        user3 = User.objects.create_user(email="u3@example.com", password="Password#123", name="U3")
        tok3 = self.client.post("/api/token/", {"email": "u3@example.com", "password": "Password#123"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tok3}")
        self.client.post(
            "/api/clients/",
            {
                "name": "User Three Zero Overlap",
                "age": 22,
                "gender": "female",
                "occupation": "Student",
                "hobbies": ["origami"],
                "favourite_foods": ["ice_cream"],
                "movie_genres": ["western"],
            },
            format="json",
        )

        # User 1 queries matches
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        matches_res = self.client.get("/api/clients/matches/")
        self.assertEqual(matches_res.status_code, status.HTTP_200_OK)
        # Should exclude user 1 itself, exclude user 3 (zero overlap), and contain user 2
        self.assertEqual(len(matches_res.data), 1)
        match = matches_res.data[0]
        self.assertEqual(match["name"], "User Two Profile")
        self.assertEqual(match["match_score"], 2)
        self.assertEqual(match["common_hobbies"], ["hiking"])
        self.assertEqual(match["common_favourite_foods"], ["sushi"])
        self.assertEqual(match["common_movie_genres"], [])
