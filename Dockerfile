# Base image
FROM node:13.7.0-alpine3.10

# Create working directory
WORKDIR /www/api

# Install nodemon for development
RUN npm install -g nodemon

# Copy package json
COPY package*.json ./

# Copy app
COPY . ./

# Install dependencies
RUN npm install

# Environment
ENV ROOT=/www/api

# Expose port
EXPOSE 80

# Run development
CMD ["npm", "run", "dev"]

# Run production
# CMD ["npm", "run", "pro"]