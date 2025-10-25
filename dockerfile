# Use an official Node.js LTS image
FROM node:18-alpine AS base

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (to leverage Docker cache)
COPY package*.json ./

RUN npm install bcrypt

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the app source code
COPY . .

# Expose the port your app runs on (usually 3000)
EXPOSE 4000

# Run the app
CMD ["node", "index.js"]
