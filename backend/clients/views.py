from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import ClientProfileFilter
from .matching import get_match_suggestions
from .models import ClientProfile, FavouriteFood, Hobby, MovieGenre
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ClientProfileSerializer,
    FavouriteFoodSerializer,
    HobbySerializer,
    MatchSerializer,
    MovieGenreSerializer,
)


class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = (
        ClientProfile.objects.select_related("user")
        .prefetch_related("hobbies", "favourite_foods", "movie_genres")
        .all()
    )
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filterset_class = ClientProfileFilter
    pagination_class = None

    def perform_create(self, serializer):
        if ClientProfile.objects.filter(user=self.request.user).exists():
            existing = ClientProfile.objects.get(user=self.request.user)
            raise ValidationError(
                {
                    "detail": "You already have a profile.",
                    "profile_id": existing.id,
                }
            )
        serializer.save()

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        try:
            profile = ClientProfile.objects.select_related("user").prefetch_related(
                "hobbies", "favourite_foods", "movie_genres"
            ).get(user=request.user)
        except ClientProfile.DoesNotExist:
            raise NotFound({"detail": "You have not created a profile yet."})

        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="matches")
    def matches(self, request):
        min_age = request.query_params.get("min_age")
        max_age = request.query_params.get("max_age")
        gender = request.query_params.get("gender")

        qs, my_hobbies, my_foods, my_genres = get_match_suggestions(
            request.user, min_age=min_age, max_age=max_age, gender=gender
        )

        context = self.get_serializer_context()
        context.update(
            {
                "my_hobbies": my_hobbies,
                "my_foods": my_foods,
                "my_genres": my_genres,
            }
        )
        serializer = MatchSerializer(qs, many=True, context=context)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HobbyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hobby.objects.all()
    serializer_class = HobbySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class FavouriteFoodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FavouriteFood.objects.all()
    serializer_class = FavouriteFoodSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class MovieGenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MovieGenre.objects.all()
    serializer_class = MovieGenreSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
