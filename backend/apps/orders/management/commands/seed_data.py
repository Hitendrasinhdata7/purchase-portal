import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.stores.models import Store
from apps.vendors.models import Vendor
from apps.products.models import Product
from apps.orders.models import Order, OrderItem


class Command(BaseCommand):
    help = "Seed the database with demo data for Purchase Portal"

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        superadmin, _ = User.objects.get_or_create(
            username="admin@store.com",
            defaults=dict(email="admin@store.com", role=User.Role.SUPERADMIN, is_staff=True, is_superuser=True),
        )
        superadmin.set_password("123456")
        superadmin.save()

        store, _ = Store.objects.get_or_create(name="Main Store", defaults=dict(address="123 Market St"))

        manager, _ = User.objects.get_or_create(
            username="manager@store.com",
            defaults=dict(email="manager@store.com", role=User.Role.STORE_ADMIN, store=store, is_staff=True),
        )
        manager.set_password("123456")
        manager.save()

        staff_users = []
        for i in range(1, 4):
            u, _ = User.objects.get_or_create(
                username=f"staff{i}@store.com",
                defaults=dict(email=f"staff{i}@store.com", role=User.Role.STAFF, store=store),
            )
            u.set_password("123456")
            u.save()
            staff_users.append(u)

        vendor_names = ["Fresh Farms Co", "Metro Wholesale", "Green Valley Produce", "Coastal Seafood", "Prime Meats"]
        vendors = []
        for name in vendor_names:
            v, _ = Vendor.objects.get_or_create(
                store=store, name=name,
                defaults=dict(contact_name=f"{name} Contact", phone="555-0100", email=f"{name.split()[0].lower()}@vendor.com"),
            )
            vendors.append(v)

        product_names = [
            "Tomatoes", "Lettuce", "Chicken Breast", "Salmon Fillet", "Olive Oil",
            "Basmati Rice", "Onions", "Bell Peppers", "Ground Beef", "Cheddar Cheese",
        ]
        products = []
        for name in product_names:
            p, _ = Product.objects.get_or_create(
                store=store, name=name,
                defaults=dict(unit="Kg", default_vendor=random.choice(vendors), price=round(random.uniform(2, 40), 2)),
            )
            products.append(p)

        if Order.objects.filter(store=store).exists():
            self.stdout.write(self.style.WARNING("Orders already seeded, skipping order creation."))
        else:
            now = timezone.now()
            for i in range(15):
                creator = random.choice(staff_users + [manager])
                order = Order.objects.create(
                    store=store, creator=creator,
                    created_at=now - timedelta(days=random.randint(0, 10)),
                )
                num_items = random.randint(2, 5)
                for _ in range(num_items):
                    product = random.choice(products)
                    item = OrderItem.objects.create(
                        order=order, product=product, product_name=product.name,
                        vendor=product.default_vendor, quantity=random.randint(1, 20),
                        unit=product.unit, added_by=creator,
                    )
                    roll = random.random()
                    if roll < 0.4:
                        pass  # stays pending / uncollected
                    elif roll < 0.7:
                        item.collected = True
                        item.collected_by = random.choice(staff_users)
                        item.collected_at = timezone.now()
                        item.save()
                    else:
                        item.collected = True
                        item.collected_by = random.choice(staff_users)
                        item.collected_at = timezone.now()
                        item.delivered = True
                        item.delivered_by = random.choice(staff_users)
                        item.delivered_at = timezone.now()
                        item.save()
                order.recompute_status()

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write("Superadmin: admin@store.com / 123456")
        self.stdout.write("Store admin: manager@store.com / 123456")
