# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json first (for caching installs)
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy all backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port Render assigns at runtime
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

