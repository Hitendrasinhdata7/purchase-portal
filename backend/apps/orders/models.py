from django.conf import settings
from django.db import models
from apps.stores.models import Store
from apps.vendors.models import Vendor
from apps.products.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PARTIAL = "PARTIAL", "Partial"
        COLLECTED = "COLLECTED", "Collected"
        DELIVERED = "DELIVERED", "Delivered"

    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="orders")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_orders"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id}"

    @property
    def order_number(self):
        return f"PO-{self.id:04d}"

    def recompute_status(self, save=True):
        items = list(self.items.all())
        if not items:
            new_status = self.Status.PENDING
        elif all(i.delivered for i in items):
            new_status = self.Status.DELIVERED
        elif all(i.collected for i in items):
            new_status = self.Status.COLLECTED
        elif any(i.collected for i in items):
            new_status = self.Status.PARTIAL
        else:
            new_status = self.Status.PENDING
        if new_status != self.status:
            self.status = new_status
            if save:
                self.save(update_fields=["status", "updated_at"])
        return self.status


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name="order_items")
    product_name = models.CharField(max_length=200)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, related_name="order_items")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit = models.CharField(max_length=20, default="Pcs")

    collected = models.BooleanField(default=False)
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    collected_at = models.DateTimeField(null=True, blank=True)

    delivered = models.BooleanField(default=False)
    delivered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    delivered_at = models.DateTimeField(null=True, blank=True)

    uncollected_reason = models.CharField(max_length=300, blank=True)

    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
