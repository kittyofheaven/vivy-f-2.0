# Gunakan image Node.js versi LTS
FROM node:18-alpine

# Set workdir
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port untuk Express
EXPOSE 3000

# Jalankan bot
CMD ["node", "index.js"] 