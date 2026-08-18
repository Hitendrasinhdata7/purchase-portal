from rest_framework import viewsets, permissions
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active", "default_vendor"]

    def get_queryset(self):
        u = self.request.user
        qs = Product.objects.all()
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
        log_activity(u, "CREATE", "Product", serializer.instance.name)

    def perform_update(self, serializer):
        serializer.save()
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "UPDATE", "Product", serializer.instance.name)

    def perform_destroy(self, instance):
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "DELETE", "Product", instance.name)
        instance.delete()
