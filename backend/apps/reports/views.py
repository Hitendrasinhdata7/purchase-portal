from datetime import timedelta

from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderItem
from apps.vendors.models import Vendor


def scoped_orders(user):
    qs = Order.objects.all()
    if not user.is_superadmin:
        qs = qs.filter(store=user.store)
    return qs


def scoped_items(user):
    qs = OrderItem.objects.all()
    if not user.is_superadmin:
        qs = qs.filter(order__store=user.store)
    return qs


class DashboardReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = scoped_orders(request.user)
        items = scoped_items(request.user)
        vendors = Vendor.objects.filter(status="ACTIVE")
        if not request.user.is_superadmin:
            vendors = vendors.filter(store=request.user.store)

        data = {
            "total_orders": orders.count(),
            "pending_orders": orders.filter(status="PENDING").count(),
            "collected_orders": orders.filter(status="COLLECTED").count(),
            "delivered_orders": orders.filter(status="DELIVERED").count(),
            "uncollected_items": items.filter(collected=False, delivered=False).count(),
            "active_vendors": vendors.count(),
        }
        return Response(data)


class VolumeReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get("days", 14))
        since = timezone.now() - timedelta(days=days)
        orders = scoped_orders(request.user).filter(created_at__gte=since)
        counts = (
            orders.extra(select={"day": "date(created_at)"})
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        return Response(list(counts))


class VendorPerformanceReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = scoped_items(request.user)
        data = (
            items.values("vendor__id", "vendor__name")
            .annotate(
                units_ordered=Sum("quantity"),
                units_collected=Sum("quantity", filter=Q(collected=True)),
            )
            .exclude(vendor__id=None)
            .order_by("-units_ordered")
        )
        return Response(list(data))


class StaffPerformanceReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = scoped_items(request.user)
        collected = (
            items.filter(collected=True)
            .values("collected_by__id", "collected_by__username")
            .annotate(collected_count=Count("id"))
        )
        delivered = (
            items.filter(delivered=True)
            .values("delivered_by__id", "delivered_by__username")
            .annotate(delivered_count=Count("id"))
        )
        merged = {}
        for row in collected:
            uid = row["collected_by__id"]
            if uid is None:
                continue
            merged.setdefault(uid, {"user_id": uid, "username": row["collected_by__username"], "collected": 0, "delivered": 0})
            merged[uid]["collected"] = row["collected_count"]
        for row in delivered:
            uid = row["delivered_by__id"]
            if uid is None:
                continue
            merged.setdefault(uid, {"user_id": uid, "username": row["delivered_by__username"], "collected": 0, "delivered": 0})
            merged[uid]["delivered"] = row["delivered_count"]
        return Response(list(merged.values()))


class UncollectedReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = scoped_items(request.user).filter(collected=False, delivered=False).select_related("order", "vendor")
        data = [
            {
                "id": i.id,
                "order_id": i.order_id,
                "order_number": i.order.order_number,
                "product_name": i.product_name,
                "vendor": i.vendor.name if i.vendor else None,
                "quantity": i.quantity,
                "unit": i.unit,
                "created_at": i.created_at,
            }
            for i in items
        ]
        return Response(data)
