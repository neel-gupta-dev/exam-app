FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev"]