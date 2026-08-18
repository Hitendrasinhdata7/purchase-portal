from .models import ActivityLog


def log_activity(user, action, target_type, target_label):
    try:
        ActivityLog.objects.create(
            store=getattr(user, "store", None),
            actor=user,
            action=action,
            target_type=target_type,
            target_label=str(target_label)[:300],
        )
    except Exception:
        pass
