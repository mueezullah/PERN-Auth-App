FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# We add --host so Vite binds to 0.0.0.0, allowing connections from the host machine
CMD ["npm", "run", "dev", "--", "--host"]
