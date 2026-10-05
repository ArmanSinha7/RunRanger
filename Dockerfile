# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Static Serving
FROM python:3.12-slim AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV RUNRANGER_DB=/app/data/runranger.db
ENV OLLAMA_URL=http://host.docker.internal:11434

