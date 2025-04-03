FROM python:3.9-slim
WORKDIR /app
COPY ./itog/backend/requirements.txt .
RUN pip install -r requirements.txt
COPY ./itog/backend/ .
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "eventlet", "app:app"]