from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsStoreAdminOrSuperAdmin
from .serializers import LoginSerializer, UserCreateSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsStoreAdminOrSuperAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        u = self.request.user
        qs = User.objects.all().order_by("-date_joined")
        if not u.is_superadmin:
            qs = qs.filter(store=u.store)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        store = serializer.validated_data.get("store")
        if not u.is_superadmin:
            store = u.store
        serializer.save(store=store)
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "CREATE", "User", serializer.instance.username)

    def destroy(self, request, *args, **kwargs):
        if request.user.role == User.Role.STAFF:
            return Response({"detail": "Staff cannot delete users."}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        from apps.activity.utils import log_activity
        log_activity(request.user, "DELETE", "User", instance.username)
        return super().destroy(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save()
        from apps.activity.utils import log_activity
        log_activity(self.request.user, "UPDATE", "User", serializer.instance.username)
