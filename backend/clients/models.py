from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class NamedTag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.name:
            self.name = self.name.strip().lower()
        super().save(*args, **kwargs)


class Hobby(NamedTag):
    class Meta(NamedTag.Meta):
        verbose_name_plural = "Hobbies"


class FavouriteFood(NamedTag):
    class Meta(NamedTag.Meta):
        verbose_name_plural = "Favourite foods"


class MovieGenre(NamedTag):
    class Meta(NamedTag.Meta):
        verbose_name_plural = "Movie genres"


class ClientProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        NON_BINARY = "non_binary", "Non-Binary"
        OTHER = "other", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_profile",
    )
    name = models.CharField(max_length=100)
    age = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(18), MaxValueValidator(99)]
    )
    gender = models.CharField(max_length=20, choices=Gender.choices)
    occupation = models.CharField(max_length=100)
    bio = models.TextField(blank=True, max_length=500)

    hobbies = models.ManyToManyField(Hobby, related_name="profiles", blank=True)
    favourite_foods = models.ManyToManyField(
        FavouriteFood, related_name="profiles", blank=True
    )
    movie_genres = models.ManyToManyField(
        MovieGenre, related_name="profiles", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["age"]),
            models.Index(fields=["gender"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.email})"
