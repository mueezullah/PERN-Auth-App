# Use the official Node.js image as our base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# We do this before copying the rest of the code to cache the npm install step
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy all the remaining backend files into the container
COPY . .

# Expose the port that your Express app runs on (commonly 5000)
EXPOSE 8080

# The command that starts your app
CMD ["npm", "run", "start"]
