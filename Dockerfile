FROM node:18-alpine

WORKDIR /app

COPY . .

RUN echo "Root Dockerfile - use docker compose to build and run services"

EXPOSE 3000 3001

CMD ["echo", "Please use docker compose up to start all services"]
