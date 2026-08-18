from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer, OrderItemCreateSerializer
from apps.activity.utils import log_activity


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = Order.objects.all().prefetch_related("items", "items__vendor")
        if not u.is_superadmin:
            qs = qs.filter(store=u.store)

        p = self.request.query_params
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("staff"):
            qs = qs.filter(creator_id=p["staff"])
        if p.get("vendor"):
            qs = qs.filter(items__vendor_id=p["vendor"]).distinct()
        if p.get("date_from"):
            qs = qs.filter(created_at__date__gte=p["date_from"])
        if p.get("date_to"):
            qs = qs.filter(created_at__date__lte=p["date_to"])
        if p.get("search"):
            s = p["search"]
            qs = qs.filter(items__product_name__icontains=s).distinct() | qs.filter(id__icontains=s)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        order = serializer.save(store=self.request.user.store, creator=self.request.user)
        log_activity(self.request.user, "CREATE", "Order", order.order_number)

    def perform_update(self, serializer):
        order = serializer.save()
        log_activity(self.request.user, "UPDATE", "Order", order.order_number)

    def perform_destroy(self, instance):
        log_activity(self.request.user, "DELETE", "Order", instance.order_number)
        instance.delete()

    @action(detail=True, methods=["post"], url_path="items")
    def add_item(self, request, pk=None):
        order = self.get_object()
        serializer = OrderItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(order=order, added_by=request.user)
        order.recompute_status()
        log_activity(request.user, "ADD_ITEM", "OrderItem", f"{item.product_name} on {order.order_number}")
        return Response(OrderItemSerializer(item).data, status=status.HTTP_201_CREATED)


class OrderItemViewSet(viewsets.GenericViewSet, viewsets.mixins.UpdateModelMixin, viewsets.mixins.DestroyModelMixin,
                        viewsets.mixins.RetrieveModelMixin):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = OrderItem.objects.select_related("order", "vendor")
        if not u.is_superadmin:
            qs = qs.filter(order__store=u.store)
        return qs

    def perform_update(self, serializer):
        item = serializer.save()
        item.order.recompute_status()
        log_activity(self.request.user, "UPDATE_ITEM", "OrderItem", item.product_name)

    def perform_destroy(self, instance):
        order = instance.order
        log_activity(self.request.user, "REMOVE_ITEM", "OrderItem", instance.product_name)
        instance.delete()
        order.recompute_status()

    @action(detail=True, methods=["post"])
    def collect(self, request, pk=None):
        item = self.get_object()
        item.collected = True
        item.collected_by = request.user
        item.collected_at = timezone.now()
        item.uncollected_reason = ""
        item.save()
        item.order.recompute_status()
        log_activity(request.user, "COLLECT", "OrderItem", item.product_name)
        return Response(OrderItemSerializer(item).data)

    @action(detail=True, methods=["post"])
    def deliver(self, request, pk=None):
        item = self.get_object()
        if not item.collected:
            return Response({"detail": "Item must be collected before delivery."}, status=400)
        item.delivered = True
        item.delivered_by = request.user
        item.delivered_at = timezone.now()
        item.save()
        item.order.recompute_status()
        log_activity(request.user, "DELIVER", "OrderItem", item.product_name)
        return Response(OrderItemSerializer(item).data)

    @action(detail=True, methods=["post"])
    def uncollect(self, request, pk=None):
        item = self.get_object()
        item.collected = False
        item.collected_by = None
        item.collected_at = None
        item.delivered = False
        item.delivered_by = None
        item.delivered_at = None
        item.uncollected_reason = request.data.get("reason", "")
        item.save()
        item.order.recompute_status()
        log_activity(request.user, "UNCOLLECT", "OrderItem", f"{item.product_name} ({item.uncollected_reason})")
        return Response(OrderItemSerializer(item).data)
