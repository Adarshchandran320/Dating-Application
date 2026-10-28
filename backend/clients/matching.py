from django.db.models import Count, F, Q
from rest_framework.exceptions import NotFound
from .models import ClientProfile


def get_match_suggestions(user, min_age=None, max_age=None, gender=None):
    """
    Computes match suggestions for the given user's client profile.
    Returns: (qs, my_hobbies, my_foods, my_genres)
    Raises NotFound if the user has no client profile.
    """
    if not hasattr(user, "client_profile") or not user.client_profile:
        raise NotFound({"detail": "Create a profile to see matches."})

    profile = user.client_profile
    my_hobbies = set(profile.hobbies.values_list("name", flat=True))
    my_foods = set(profile.favourite_foods.values_list("name", flat=True))
    my_genres = set(profile.movie_genres.values_list("name", flat=True))

    # If the user has no tags at all, they cannot have matches
    if not my_hobbies and not my_foods and not my_genres:
        return ClientProfile.objects.none(), my_hobbies, my_foods, my_genres

    qs = (
        ClientProfile.objects.exclude(user=user)
        .annotate(
            common_hobby_count=Count(
                "hobbies", filter=Q(hobbies__name__in=my_hobbies), distinct=True
            ),
            common_food_count=Count(
                "favourite_foods",
                filter=Q(favourite_foods__name__in=my_foods),
                distinct=True,
            ),
            common_genre_count=Count(
                "movie_genres",
                filter=Q(movie_genres__name__in=my_genres),
                distinct=True,
            ),
        )
        .annotate(
            match_score=F("common_hobby_count")
            + F("common_food_count")
            + F("common_genre_count")
        )
        .filter(match_score__gt=0)
    )

    if min_age:
        try:
            qs = qs.filter(age__gte=int(min_age))
        except (ValueError, TypeError):
            pass

    if max_age:
        try:
            qs = qs.filter(age__lte=int(max_age))
        except (ValueError, TypeError):
            pass

    if gender:
        qs = qs.filter(gender__iexact=gender.strip())

    qs = (
        qs.order_by("-match_score", "-created_at")
        .select_related("user")
        .prefetch_related("hobbies", "favourite_foods", "movie_genres")
    )

    return qs, my_hobbies, my_foods, my_genres
