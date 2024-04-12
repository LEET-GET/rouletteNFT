from django.contrib import admin

from payments.models import Bill, BillManager, Transaction


class BillAdmin(admin.ModelAdmin):
    readonly_fields = ('user', 'amount')


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('amount', 'currency')
    readonly_fields = ('user', 'amount', 'status', 'bill', 'order_id')


class BillManagerAdmin(admin.ModelAdmin):
    list_display = ('id', 'slug', 'ratio')

admin.site.register(Bill, BillAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(BillManager, BillManagerAdmin)
