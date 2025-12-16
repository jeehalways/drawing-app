# Use Debian-based Node image (Prisma-safe)
FROM node:20

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]



