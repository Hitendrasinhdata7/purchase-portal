from rest_framework import viewsets, permissions
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = ActivityLog.objects.all()
        if not u.is_superadmin:
            qs = qs.filter(store=u.store)
        p = self.request.query_params
        if p.get("actor"):
            qs = qs.filter(actor_id=p["actor"])
        if p.get("action"):
            qs = qs.filter(action=p["action"])
        if p.get("search"):
            qs = qs.filter(target_label__icontains=p["search"])
        if p.get("date_from"):
            qs = qs.filter(created_at__date__gte=p["date_from"])
        if p.get("date_to"):
            qs = qs.filter(created_at__date__lte=p["date_to"])
        return qs
