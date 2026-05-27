# --- Stage 1: Build the React/Vite app ---
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the production bundle
RUN npm run build

# --- Stage 2: Serve the app with Nginx ---
FROM nginx:alpine

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage to nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
