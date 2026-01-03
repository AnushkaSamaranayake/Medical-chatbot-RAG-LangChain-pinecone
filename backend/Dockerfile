FROM python:3.10-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5000
EXPOSE 5000

# Gunicorn command to run the app
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
