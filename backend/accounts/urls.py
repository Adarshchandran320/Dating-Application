from django.urls import path, re_path
from .views import RegisterView, MeView

urlpatterns = [
    re_path(r"^users/signup/?$", RegisterView.as_view(), name="signup"),
    path("users/me/", MeView.as_view(), name="me"),
]
