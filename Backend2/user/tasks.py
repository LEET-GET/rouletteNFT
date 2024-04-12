from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from src import settings
from src.settings import HOST


@shared_task
def send_message_to_email(email: str, token, uid):
    data = {
        'token': token,
        'uid': uid
    }
    subject = 'Подтверждение почты'
    html_message = render_to_string('email.html', {'data': data, 'host': HOST})
    plain_message = strip_tags(html_message)
    email = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=settings.EMAIL_HOST_USER,
        to=[email],
    )

    email.attach_alternative(html_message, "text/html")
    email.send()
