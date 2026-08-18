from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id", "store", "name", "contact_name", "phone", "email",
            "status", "notes", "created_at",
        ]
        read_only_fields = ["store"]
