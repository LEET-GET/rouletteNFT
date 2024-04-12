FROM python:3.8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code/
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

COPY ./scripts /scripts

RUN chmod +x /scripts/*

CMD ["scripts/entrypoint.sh"]
