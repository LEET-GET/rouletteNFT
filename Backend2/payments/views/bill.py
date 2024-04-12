from rest_framework import generics

from payments.models import Bill
from payments.serializers import BillGetSerializer


class BillGetView(generics.RetrieveAPIView):
    serializer_class = BillGetSerializer

    def get_queryset(self):
        return Bill.objects.filter(user=self.request.user)

    def get_object(self):
        try:
            return Bill.objects.get(user=self.request.user)
        except Bill.DoesNotExist:
            # Handle the error or create a new bill here, based on your requirements
            return None

