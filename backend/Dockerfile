# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json first (for caching installs)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Build Prisma client
RUN npx prisma generate

# Expose port (Render will assign PORT env var)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
