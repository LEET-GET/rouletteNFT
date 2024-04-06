from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from payments.models.base import BaseModel

User = get_user_model()


class Bill(BaseModel):
    user = models.OneToOneField(to=User, on_delete=models.SET_NULL, related_name='bill', null=True, blank=True)
    amount = models.DecimalField(default=0, max_digits=16, decimal_places=2)


    class Meta:
        verbose_name = 'Счет'
        verbose_name_plural = 'Счета'


class BillManager(models.Model):
    currency = models.CharField(max_length=10)
    ratio = models.DecimalField(max_digits=16, decimal_places=2)
    slug = models.SlugField(unique=True)


@receiver(post_save, sender=User)
def create_user_bill(sender, instance, created, **kwargs):
    if created:
        Bill.objects.create(user=instance)
