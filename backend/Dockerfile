# Node.js Lightweight Container for Express Backend
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
