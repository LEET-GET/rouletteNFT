from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class TransactionStatus(models.TextChoices):
    PENDING = 'pending', _("В ожидании")
    CANCELED = 'canceled', _("Отменено")
    SUCCESS = 'success', _('Успешна')

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='transactions', null=True, blank=True)
    amount = models.DecimalField(default=0, max_digits=16, decimal_places=2)
    bill = models.ForeignKey('Bill', on_delete=models.SET_NULL, related_name='transactions', null=True, blank=True)
    currency = models.CharField(default='USD', max_length=16)
    status = models.CharField(choices=TransactionStatus.choices, default=TransactionStatus.PENDING, max_length=16)
    order_id = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Transaction')
        verbose_name_plural = _('Transactions')

    def __str__(self):
        return f"Transaction {self.id} - Amount: {self.amount}"

# Signal to update related bill on transaction update
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Transaction)
def update_bill(sender, instance, **kwargs):
    if instance.bill:
        instance.bill.save()
