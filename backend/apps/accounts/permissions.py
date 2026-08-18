from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superadmin)


class IsStoreAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_superadmin or u.is_store_admin))


class IsStoreMember(BasePermission):
    """Allows any authenticated user scoped to their store; write access
    restricted to store admins/superadmins except for staff-permitted actions
    handled at the view level."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        u = request.user
        if u.is_superadmin:
            return True
        obj_store = getattr(obj, "store", None)
        if request.method in SAFE_METHODS:
            return obj_store == u.store
        if u.is_store_admin:
            return obj_store == u.store
        # staff: allowed to update but not delete users; view enforces specifics
        return obj_store == u.store
