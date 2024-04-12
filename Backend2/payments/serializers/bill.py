from rest_framework.serializers import ModelSerializer

from payments.models import Bill


class BillGetSerializer(ModelSerializer):
    class Meta:
        model = Bill
        fields = ('amount',)
