from django.contrib import admin
from django.conf import settings
from django.urls import path, re_path, include
from django.views.static import serve as static_serve
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

urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", static_serve, {"document_root": settings.MEDIA_ROOT}),
]