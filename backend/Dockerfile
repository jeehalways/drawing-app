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

# Generate Prisma client
RUN npm run build
RUN npx prisma generate

# Expose port Render assigns at runtime
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]

