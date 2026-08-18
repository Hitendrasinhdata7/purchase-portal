from django.urls import path
from .views import (
    DashboardReportView, VolumeReportView, VendorPerformanceReportView,
    StaffPerformanceReportView, UncollectedReportView,
)

urlpatterns = [
    path("dashboard/", DashboardReportView.as_view()),
    path("volume/", VolumeReportView.as_view()),
    path("vendor-performance/", VendorPerformanceReportView.as_view()),
    path("staff-performance/", StaffPerformanceReportView.as_view()),
    path("uncollected/", UncollectedReportView.as_view()),
]
