from rest_framework import serializers
from payments.models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'status', 'invoice_id', 'amount_crypto', 'currency', 'order_id', 'created_at')

    amount_crypto = serializers.DecimalField(max_digits=16, decimal_places=2)

class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('amount', 'currency')

    def validate_currency(self, value):
        allowed_currencies = {'USD', 'EUR', 'JPY'}  # Example set of allowed currencies
        if value not in allowed_currencies:
            raise serializers.ValidationError(f"{value} is not a valid currency.")
        return value
