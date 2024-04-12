import decimal
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum, signals
from django.dispatch import receiver
from django.db.models.functions import Coalesce
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class Bill(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, related_name='bill', null=True, blank=True)
    amount = models.DecimalField(default=0, max_digits=16, decimal_places=2)

    class Meta:
        verbose_name = _('Bill')
        verbose_name_plural = _('Bills')

    def save(self, *args, **kwargs):
        if self.id:
            success_transactions = self.transactions.filter(status='success')
            self.amount = success_transactions.aggregate(total=Coalesce(Sum('amount'), decimal.Decimal(0)))['total']
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user}'s bill: {self.amount}"

class BillManager(models.Model):
    currency = models.CharField(max_length=10)
    ratio = models.DecimalField(max_digits=16, decimal_places=2)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = _('Currency Ratio')
        verbose_name_plural = _('Currency Ratios')

    def __str__(self):
        return f"{self.currency} Ratio: {self.ratio}"

@receiver(signals.post_save, sender=User)
def create_user_bill(sender, instance, created, **kwargs):
    if created:
        Bill.objects.create(user=instance)
