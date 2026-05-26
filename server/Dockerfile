# Use the official Node.js image
FROM node:22-alpine
WORKDIR /app

# Install dependencies first (for better Docker caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your server code
COPY . .

# Expose port 5000 and set it as an environment variable
EXPOSE 5000
ENV PORT=5000

# Command to run your server (change index.js if your entry file is different)
CMD ["node", "api/index.js"]