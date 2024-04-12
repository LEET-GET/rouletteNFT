from django.urls import path

from payments.views import BillGetView
from payments.views.transaction import TransactionList, TransactionVerify

app_name = 'payments'

urlpatterns = [
    path('bill/', BillGetView.as_view()),
    path('transaction/', TransactionList.as_view()),
    path('verify/', TransactionVerify.as_view()),
]
