from rest_framework import generics, status, permissions
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from django.db import transaction as db_transaction  # Changed import here

from payments.models import Transaction
from payments.models.transaction import TransactionStatus
from payments.sdk import CryptoCloudSDK
from payments.serializers.transaction import TransactionCreateSerializer, TransactionSerializer
from src.settings import API_KEY, SHOP_ID

class TransactionList(generics.CreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        return serializer.save(user=self.request.user, bill=self.request.user.bill)  # Ensuring return

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with db_transaction.atomic():  # Use the correctly aliased transaction module
                transaction = self.perform_create(serializer)  # Ensure transaction is assigned
                crypto = CryptoCloudSDK(API_KEY)
                invoice_data = {
                    "amount": str(transaction.amount),
                    "shop_id": SHOP_ID,
                    "currency": transaction.currency,
                    "order_id": str(transaction.id),
                    "add_fields": {
                        "time_to_pay": {"hours": 12, "minutes": 30},
                        "email_to_send": "Cfomoneymaker@gmail.com",
                        "available_currencies": [transaction.currency],
                        "period": "month"
                    }
                }
                try:
                    invoice = crypto.create_invoice(invoice_data)
                    if invoice.get('status') == 'success':
                        return Response({'message': invoice.get('result', {}).get('link')}, status=status.HTTP_201_CREATED)
                except Exception as e:
                    return Response({"message": f"Error while creating a transaction: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "Error while creating a transaction"}, status=status.HTTP_400_BAD_REQUEST)

class TransactionVerify(generics.CreateAPIView):
    serializer_class = TransactionSerializer

    @db_transaction.atomic  # Corrected decorator use
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            transaction = get_object_or_404(Transaction, order_id=data['order_id'])
            if data['status'] == 'success':
                transaction.status = TransactionStatus.SUCCESS
            else:
                transaction.status = TransactionStatus.CANCELED
            transaction.save()
            return Response({"message": "Transaction status updated"}, status=status.HTTP_200_OK)
