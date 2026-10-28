from django.contrib import admin
from .models import Hobby, FavouriteFood, MovieGenre, ClientProfile


@admin.register(Hobby)
class HobbyAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(FavouriteFood)
class FavouriteFoodAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(MovieGenre)
class MovieGenreAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "age", "gender", "occupation", "created_at")
    list_filter = ("gender", "age")
    search_fields = ("name", "occupation", "user__email")
    raw_id_fields = ("user",)
