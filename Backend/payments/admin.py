from django.contrib import admin

from payments.models import Bill, BillManager


class BillAdmin(admin.ModelAdmin):
    readonly_fields = ('user', 'amount')

admin.site.register(Bill, BillAdmin)
admin.site.register(BillManager)
