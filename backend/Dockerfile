FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma config + schema
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the backend code
COPY . .

# Build TypeScript (creates dist/)
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
