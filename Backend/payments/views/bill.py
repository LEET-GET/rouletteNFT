from rest_framework import generics

from payments.models import Bill
from payments.serializers import BillGetSerializer


class BillGetView(generics.RetrieveAPIView):
    serializer_class = BillGetSerializer

    def get_queryset(self):
        return Bill.objects.filter(user=self.request.user)

    def get_object(self):
        return Bill.objects.get(user=self.request.user)
