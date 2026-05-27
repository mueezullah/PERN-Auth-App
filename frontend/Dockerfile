# --- Stage 1: Build the React/Vite app ---
FROM node:20-alpine AS frontend-builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 5173 to th    e outside world
EXPOSE 5173

# Start Nginx
CMD ["npm", "run", "dev"]
