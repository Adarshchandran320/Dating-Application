from rest_framework.routers import DefaultRouter
from .views import (
    ClientProfileViewSet,
    HobbyViewSet,
    FavouriteFoodViewSet,
    MovieGenreViewSet,
)

router = DefaultRouter()
router.register(r"clients", ClientProfileViewSet, basename="client")
router.register(r"hobbies", HobbyViewSet, basename="hobby")
router.register(r"favourite-foods", FavouriteFoodViewSet, basename="favourite-food")
router.register(r"movie-genres", MovieGenreViewSet, basename="movie-genre")

urlpatterns = router.urls
