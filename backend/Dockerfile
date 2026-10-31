# Start from an official Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies first (helps Docker cache this layer)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the application source
COPY . .

# Document the port used by the API
EXPOSE 5000

CMD ["npm", "start"]