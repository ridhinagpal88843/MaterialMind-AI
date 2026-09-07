# ==============================================================================
# Stage 1: Frontend Build Environment
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package descriptors and install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy frontend source code and compile production assets
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Runtime Environment
# ==============================================================================
FROM python:3.11-slim AS production

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies needed for runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python production dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application, frozen ML models, and processed data
COPY backend/ ./backend/
COPY models/ ./models/
COPY data/processed/ ./data/processed/

# Copy compiled React frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose server port (supports dynamic cloud port mapping)
EXPOSE 8000

# Health check against API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start FastAPI production server
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
