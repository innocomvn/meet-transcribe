# Development Dockerfile for Frontend

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
