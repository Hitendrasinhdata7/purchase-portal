from django.contrib import admin
from django.urls import path, include
from .health import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/stores/", include("apps.stores.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/activity/", include("apps.activity.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/users/", include("apps.accounts.user_urls")),
]
