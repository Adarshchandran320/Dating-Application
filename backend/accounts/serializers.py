from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ("id", "name", "email", "password", "confirm_password")
        read_only_fields = ("id",)

    def validate_name(self, value):
        stripped = value.strip()
        if len(stripped) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return stripped

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "email", "profile_id")
        read_only_fields = ("id", "name", "email", "profile_id")

    def get_profile_id(self, obj):
        if hasattr(obj, "client_profile") and obj.client_profile:
            return obj.client_profile.id
        return None
