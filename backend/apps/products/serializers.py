from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    default_vendor_name = serializers.CharField(source="default_vendor.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "store", "name", "brand", "category", "size_weight", "barcode",
            "sku", "unit", "default_vendor", "default_vendor_name", "quantity",
            "price", "image", "notes", "is_active", "created_at",
        ]
        read_only_fields = ["store"]
