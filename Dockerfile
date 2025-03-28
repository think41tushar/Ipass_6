# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the frontend code
COPY . .

# Expose the port that your app runs on (adjust if necessary)
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]