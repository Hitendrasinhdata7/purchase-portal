from rest_framework import viewsets, permissions
from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status"]

    def get_queryset(self):
        u = self.request.user
        qs = Vendor.objects.all()
        if not u.is_superadmin:
            qs = qs.filter(store=u.store)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        serializer.save(store=u.store)
        from apps.activity.utils import log_activity
        log_activity(u, "CREATE", "Vendor", serializer.instance.name)

    def perform_update(self, serializer):
        serializer.save()
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "UPDATE", "Vendor", serializer.instance.name)

    def perform_destroy(self, instance):
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "DELETE", "Vendor", instance.name)
        instance.delete()
