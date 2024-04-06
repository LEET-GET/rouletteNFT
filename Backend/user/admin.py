from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user.models import User
from django.utils.translation import gettext_lazy as _


class CustomUserAdmin(UserAdmin):
    list_display = ("id", "first_name", "last_name", "username")
    ordering = ('id',)
    fieldsets = (
        (None, {"fields": ("email", "username")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

admin.site.register(User, CustomUserAdmin)

