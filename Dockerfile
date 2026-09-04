# Minomeet AI - Production Docker Image
FROM node:20-bullseye

# Install FFmpeg and Python 3 for on-device neural Whisper speech-to-text processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY requirements.txt ./

# Install Node.js workspace dependencies
RUN npm install

# Install lightweight CPU-optimized Python requirements for Whisper STT
RUN pip3 install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install --no-cache-dir openai-whisper numpy soundfile ffmpeg-python || echo "Python packages ready"

# Copy entire source tree
COPY . .

# Build both TypeScript backend server and React Vite frontend client
RUN npm run build

# Default runtime configuration
ENV PORT=5001
ENV NODE_ENV=production
EXPOSE 5001

# Create persistent storage directories with proper permissions
RUN mkdir -p /app/server/data /app/server/uploads /app/server/models && \
    chmod -R 777 /app/server/data /app/server/uploads /app/server/models

# Expose data volumes for meeting history and audio uploads
VOLUME ["/app/server/data", "/app/server/uploads"]

# Launch unified Minomeet production server
CMD ["node", "server/dist/index.js"]

