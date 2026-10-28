import django_filters
from rest_framework.exceptions import ValidationError
from .models import ClientProfile


class ClientProfileFilter(django_filters.FilterSet):
    min_age = django_filters.NumberFilter(field_name="age", lookup_expr="gte")
    max_age = django_filters.NumberFilter(field_name="age", lookup_expr="lte")
    gender = django_filters.CharFilter(method="filter_gender")
    hobbies = django_filters.CharFilter(method="filter_hobbies")
    favourite_foods = django_filters.CharFilter(method="filter_favourite_foods")
    movie_genres = django_filters.CharFilter(method="filter_movie_genres")

    class Meta:
        model = ClientProfile
        fields = [
            "min_age",
            "max_age",
            "gender",
            "hobbies",
            "favourite_foods",
            "movie_genres",
        ]

    def filter_gender(self, queryset, name, value):
        if value:
            return queryset.filter(gender__iexact=value.strip())
        return queryset

    def filter_hobbies(self, queryset, name, value):
        if not value:
            return queryset
        items = [x.strip().lower() for x in value.split(",") if x.strip()]
        if items:
            return queryset.filter(hobbies__name__in=items).distinct()
        return queryset

    def filter_favourite_foods(self, queryset, name, value):
        if not value:
            return queryset
        items = [x.strip().lower() for x in value.split(",") if x.strip()]
        if items:
            return queryset.filter(favourite_foods__name__in=items).distinct()
        return queryset

    def filter_movie_genres(self, queryset, name, value):
        if not value:
            return queryset
        items = [x.strip().lower() for x in value.split(",") if x.strip()]
        if items:
            return queryset.filter(movie_genres__name__in=items).distinct()
        return queryset

    @property
    def qs(self):
        min_age_raw = self.data.get("min_age")
        max_age_raw = self.data.get("max_age")

        if min_age_raw is not None and max_age_raw is not None:
            min_str = str(min_age_raw).strip()
            max_str = str(max_age_raw).strip()
            if min_str and max_str:
                try:
                    min_val = int(min_str)
                    max_val = int(max_str)
                    if min_val > max_val:
                        raise ValidationError({"detail": "min_age cannot be greater than max_age."})
                except ValueError:
                    pass

        return super().qs
