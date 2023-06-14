# Use the official Node.js version 16 image as the base
FROM node:16

# Update npm to version 9.7.1
RUN npm install -g npm@9.7.1

# Set the working directory inside the container
WORKDIR /folder

# Copy all files and directories to the working directory
COPY . .

# Install production dependencies
RUN npm install --production

# Install additional packages required for building
RUN npm install --save-dev @typescript-eslint/eslint-plugin
RUN npm install --save @overwolf/types

# Run the build command
RUN npm run build

# Define the default command to start the application
CMD ["npm", "start"]
