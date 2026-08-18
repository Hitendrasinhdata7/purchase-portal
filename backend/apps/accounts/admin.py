from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "role", "store", "is_active_staff"]
    fieldsets = UserAdmin.fieldsets + (
        ("Purchase Portal", {"fields": ("role", "store", "phone", "is_active_staff")}),
    )
