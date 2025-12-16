# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json first (for caching installs)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend code
COPY . .

RUN npm run build

EXPOSE 3000

# Prisma generate happens at runtime, NOT build time
CMD sh -c "npx prisma generate && node dist/index.js"


