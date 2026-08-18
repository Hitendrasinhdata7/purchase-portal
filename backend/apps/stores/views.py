from rest_framework import viewsets
from apps.accounts.permissions import IsSuperAdmin
from .models import Store
from .serializers import StoreSerializer


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsSuperAdmin]
