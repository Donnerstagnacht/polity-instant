FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Start in dev mode - bind to 0.0.0.0 so it's accessible outside the container
CMD ["npx", "vinxi", "dev", "--port", "3000", "--host", "0.0.0.0"]
