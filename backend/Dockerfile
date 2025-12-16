FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install ts-node globally (optional if using ts-node for direct execution)
RUN npm install -g ts-node typescript

# Run Prisma generate before starting the app
RUN npx prisma generate

# Build TypeScript into JavaScript
RUN npm run build

EXPOSE 3000

# Run the app from the dist/ folder
CMD ["node", "dist/index.js"]





