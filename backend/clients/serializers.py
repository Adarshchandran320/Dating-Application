from django.db import transaction
from rest_framework import serializers
from .models import ClientProfile, Hobby, FavouriteFood, MovieGenre


class TagListField(serializers.Field):
    def __init__(self, tag_model, **kwargs):
        self.tag_model = tag_model
        super().__init__(**kwargs)

    def to_representation(self, value):
        if hasattr(value, "all"):
            return sorted([item.name for item in value.all()])
        if isinstance(value, (list, tuple, set)):
            return sorted([getattr(item, "name", str(item)) for item in value])
        return []

    def to_internal_value(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError("Expected a list of items.")

        cleaned = []
        for item in data:
            if not isinstance(item, str):
                raise serializers.ValidationError("Each item must be a string.")
            val = item.strip().lower()
            if not val:
                continue
            if len(val) > 50:
                raise serializers.ValidationError(
                    f"Item '{val}' exceeds maximum length of 50 characters."
                )
            if val not in cleaned:
                cleaned.append(val)

        if len(cleaned) > 15:
            raise serializers.ValidationError("Maximum 15 items allowed.")

        return cleaned


class HobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = Hobby
        fields = ("id", "name")
        read_only_fields = ("id", "name")


class FavouriteFoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavouriteFood
        fields = ("id", "name")
        read_only_fields = ("id", "name")


class MovieGenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieGenre
        fields = ("id", "name")
        read_only_fields = ("id", "name")


class ClientProfileSerializer(serializers.ModelSerializer):
    hobbies = TagListField(tag_model=Hobby, required=False)
    favourite_foods = TagListField(tag_model=FavouriteFood, required=False)
    movie_genres = TagListField(tag_model=MovieGenre, required=False)
    owner_name = serializers.CharField(source="user.name", read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = ClientProfile
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "occupation",
            "bio",
            "hobbies",
            "favourite_foods",
            "movie_genres",
            "owner_name",
            "is_owner",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner_name", "is_owner", "created_at", "updated_at")

    def get_is_owner(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

    def validate_name(self, value):
        stripped = value.strip()
        if len(stripped) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return stripped

    def validate_occupation(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Occupation is required.")
        return stripped

    def validate_age(self, value):
        if value < 18 or value > 99:
            raise serializers.ValidationError("Age must be between 18 and 99.")
        return value

    def validate(self, attrs):
        # On create, require at least 1 item in each tag list
        if self.instance is None:
            for field_name in ("hobbies", "favourite_foods", "movie_genres"):
                tags = attrs.get(field_name)
                if not tags or len(tags) < 1:
                    raise serializers.ValidationError(
                        {field_name: f"At least one {field_name.replace('_', ' ')} is required."}
                    )
        else:
            # On update, if supplied, must not be empty
            for field_name in ("hobbies", "favourite_foods", "movie_genres"):
                if field_name in attrs and len(attrs[field_name]) < 1:
                    raise serializers.ValidationError(
                        {field_name: f"At least one {field_name.replace('_', ' ')} is required."}
                    )
        return attrs

    def _set_tags(self, instance, hobbies=None, foods=None, genres=None):
        if hobbies is not None:
            objs = [Hobby.objects.get_or_create(name=name)[0] for name in hobbies]
            instance.hobbies.set(objs)
        if foods is not None:
            objs = [
                FavouriteFood.objects.get_or_create(name=name)[0] for name in foods
            ]
            instance.favourite_foods.set(objs)
        if genres is not None:
            objs = [MovieGenre.objects.get_or_create(name=name)[0] for name in genres]
            instance.movie_genres.set(objs)

    def create(self, validated_data):
        with transaction.atomic():
            hobbies = validated_data.pop("hobbies", [])
            foods = validated_data.pop("favourite_foods", [])
            genres = validated_data.pop("movie_genres", [])
            user = self.context["request"].user
            profile = ClientProfile.objects.create(user=user, **validated_data)
            self._set_tags(profile, hobbies=hobbies, foods=foods, genres=genres)
            return profile

    def update(self, instance, validated_data):
        with transaction.atomic():
            hobbies = validated_data.pop("hobbies", None)
            foods = validated_data.pop("favourite_foods", None)
            genres = validated_data.pop("movie_genres", None)

            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()

            self._set_tags(instance, hobbies=hobbies, foods=foods, genres=genres)
            return instance


class MatchSerializer(ClientProfileSerializer):
    common_hobbies = serializers.SerializerMethodField()
    common_favourite_foods = serializers.SerializerMethodField()
    common_movie_genres = serializers.SerializerMethodField()
    match_score = serializers.IntegerField(read_only=True)

    class Meta(ClientProfileSerializer.Meta):
        fields = ClientProfileSerializer.Meta.fields + (
            "common_hobbies",
            "common_favourite_foods",
            "common_movie_genres",
            "match_score",
        )

    def get_common_hobbies(self, obj):
        my_hobbies = self.context.get("my_hobbies", set())
        obj_hobbies = {h.name for h in obj.hobbies.all()}
        return sorted(list(my_hobbies & obj_hobbies))

    def get_common_favourite_foods(self, obj):
        my_foods = self.context.get("my_foods", set())
        obj_foods = {f.name for f in obj.favourite_foods.all()}
        return sorted(list(my_foods & obj_foods))

    def get_common_movie_genres(self, obj):
        my_genres = self.context.get("my_genres", set())
        obj_genres = {g.name for g in obj.movie_genres.all()}
        return sorted(list(my_genres & obj_genres))
