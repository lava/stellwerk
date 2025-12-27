# Use an official Node.js runtime as a parent image
FROM node:24
ARG ORIGIN

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install project dependencies
RUN pnpm install

# Copy the rest of the application code to the container
COPY . .

ENV ORIGIN=$ORIGIN
ENV HOST=0.0.0.0

# Build the Svelte app
RUN pnpm build

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["bash", "-c", "pnpm drizzle-kit push && node build/index.js"]
