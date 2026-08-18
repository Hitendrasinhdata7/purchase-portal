from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    collected_by_name = serializers.CharField(source="collected_by.username", read_only=True)
    delivered_by_name = serializers.CharField(source="delivered_by.username", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_name", "vendor", "vendor_name",
            "quantity", "unit", "collected", "collected_by", "collected_by_name",
            "collected_at", "delivered", "delivered_by", "delivered_by_name",
            "delivered_at", "uncollected_reason", "added_by", "created_at", "updated_at",
        ]
        read_only_fields = ["order", "collected_by", "collected_at", "delivered_by", "delivered_at", "added_by"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    creator_name = serializers.CharField(source="creator.username", read_only=True)
    order_number = serializers.CharField(read_only=True)
    vendors = serializers.SerializerMethodField()
    total_units = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "store", "creator", "creator_name", "status",
            "notes", "created_at", "updated_at", "items", "vendors", "total_units",
        ]
        read_only_fields = ["store", "creator", "status"]

    def get_vendors(self, obj):
        return sorted({i.vendor.name for i in obj.items.all() if i.vendor})

    def get_total_units(self, obj):
        return sum((i.quantity for i in obj.items.all()), 0)


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "vendor", "quantity", "unit"]
