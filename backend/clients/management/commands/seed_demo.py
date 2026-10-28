from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from clients.models import ClientProfile, FavouriteFood, Hobby, MovieGenre

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds 10 demo users with complete profiles and overlapping tags for matching/filtering."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding demo users and profiles..."))

        demo_data = [
            {
                "email": "demo1@example.com",
                "name": "Alex Mercer",
                "age": 28,
                "gender": "male",
                "occupation": "Software Engineer",
                "bio": "Passionate about open source, weekend mountain hiking, and artisan coffee.",
                "hobbies": ["hiking", "photography", "coding", "gaming"],
                "favourite_foods": ["sushi", "pizza", "tacos"],
                "movie_genres": ["sci-fi", "action", "thriller"],
            },
            {
                "email": "demo2@example.com",
                "name": "Elena Rostova",
                "age": 26,
                "gender": "female",
                "occupation": "Graphic Designer",
                "bio": "Illustrator by day, indie film buff by night. Always down for good tacos.",
                "hobbies": ["photography", "painting", "yoga", "reading"],
                "favourite_foods": ["tacos", "ramen", "salad"],
                "movie_genres": ["animation", "sci-fi", "romance"],
            },
            {
                "email": "demo3@example.com",
                "name": "Jordan Lee",
                "age": 31,
                "gender": "non_binary",
                "occupation": "UX Researcher",
                "bio": "Curious human who loves rock climbing, tabletop board games, and ramen.",
                "hobbies": ["hiking", "gaming", "cooking", "travel"],
                "favourite_foods": ["ramen", "sushi", "curry"],
                "movie_genres": ["sci-fi", "documentary", "comedy"],
            },
            {
                "email": "demo4@example.com",
                "name": "Marcus Vance",
                "age": 34,
                "gender": "male",
                "occupation": "Product Manager",
                "bio": "Fitness enthusiast, home barista, and thriller movie marathoner.",
                "hobbies": ["running", "cooking", "reading", "travel"],
                "favourite_foods": ["pasta", "pizza", "steak"],
                "movie_genres": ["thriller", "action", "mystery"],
            },
            {
                "email": "demo5@example.com",
                "name": "Sophia Chen",
                "age": 24,
                "gender": "female",
                "occupation": "Data Analyst",
                "bio": "Numbers lover with a passion for baking pastries and high fantasy novels.",
                "hobbies": ["baking", "reading", "gaming", "yoga"],
                "favourite_foods": ["dim sum", "ramen", "sushi"],
                "movie_genres": ["fantasy", "sci-fi", "animation"],
            },
            {
                "email": "demo6@example.com",
                "name": "Sam Taylor",
                "age": 29,
                "gender": "other",
                "occupation": "Journalist",
                "bio": "Documenting urban stories, hunting vinyl records, and exploring street food.",
                "hobbies": ["writing", "photography", "travel", "hiking"],
                "favourite_foods": ["tacos", "curry", "thai"],
                "movie_genres": ["documentary", "drama", "thriller"],
            },
            {
                "email": "demo7@example.com",
                "name": "David Miller",
                "age": 42,
                "gender": "male",
                "occupation": "Architect",
                "bio": "Designing sustainable spaces, listening to jazz, and enjoying fine Italian cuisine.",
                "hobbies": ["sketching", "travel", "cycling", "reading"],
                "favourite_foods": ["pasta", "seafood", "salad"],
                "movie_genres": ["drama", "historical", "mystery"],
            },
            {
                "email": "demo8@example.com",
                "name": "Priya Sharma",
                "age": 27,
                "gender": "female",
                "occupation": "Marketing Strategist",
                "bio": "Travel addict, spicy street food seeker, and standup comedy enthusiast.",
                "hobbies": ["dancing", "travel", "yoga", "cooking"],
                "favourite_foods": ["curry", "chaat", "tacos"],
                "movie_genres": ["comedy", "romance", "drama"],
            },
            {
                "email": "demo9@example.com",
                "name": "Kai Rivera",
                "age": 22,
                "gender": "non_binary",
                "occupation": "College Student & Barista",
                "bio": "Indie music fan, anime streamer, and late-night gamer.",
                "hobbies": ["gaming", "coding", "drawing", "guitar"],
                "favourite_foods": ["pizza", "ramen", "burgers"],
                "movie_genres": ["animation", "sci-fi", "comedy"],
            },
            {
                "email": "demo10@example.com",
                "name": "Chloe Bennett",
                "age": 38,
                "gender": "female",
                "occupation": "Pediatrician",
                "bio": "Caring doctor, avid marathon runner, and gourmet home chef.",
                "hobbies": ["running", "gardening", "cooking", "hiking"],
                "favourite_foods": ["sushi", "pasta", "salad"],
                "movie_genres": ["mystery", "thriller", "drama"],
            },
        ]

        password = "DemoPass#123"

        with transaction.atomic():
            for item in demo_data:
                user, created = User.objects.get_or_create(
                    email=item["email"],
                    defaults={"name": item["name"]},
                )
                if created or not user.check_password(password):
                    user.set_password(password)
                    user.name = item["name"]
                    user.save()

                profile, p_created = ClientProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "name": item["name"],
                        "age": item["age"],
                        "gender": item["gender"],
                        "occupation": item["occupation"],
                        "bio": item["bio"],
                    },
                )
                if not p_created:
                    profile.name = item["name"]
                    profile.age = item["age"]
                    profile.gender = item["gender"]
                    profile.occupation = item["occupation"]
                    profile.bio = item["bio"]
                    profile.save()

                hobby_objs = [
                    Hobby.objects.get_or_create(name=name.strip().lower())[0]
                    for name in item["hobbies"]
                ]
                profile.hobbies.set(hobby_objs)

                food_objs = [
                    FavouriteFood.objects.get_or_create(name=name.strip().lower())[0]
                    for name in item["favourite_foods"]
                ]
                profile.favourite_foods.set(food_objs)

                genre_objs = [
                    MovieGenre.objects.get_or_create(name=name.strip().lower())[0]
                    for name in item["movie_genres"]
                ]
                profile.movie_genres.set(genre_objs)

        self.stdout.write(self.style.SUCCESS("Successfully seeded 10 demo users and profiles!"))
        self.stdout.write("--------------------------------------------------")
        self.stdout.write("Demo credentials (all users have password: DemoPass#123):")
        for i in range(1, 11):
            self.stdout.write(f"  User {i}: demo{i}@example.com  /  DemoPass#123")
        self.stdout.write("--------------------------------------------------")
