# Use Debian-based Node image (Prisma-safe)
FROM node:20

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client at build time
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]



