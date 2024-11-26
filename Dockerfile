# Use the official Playwright image
FROM mcr.microsoft.com/playwright:v1.39.0

# Set the working directory
WORKDIR /app

# Copy your files into the container
COPY . .

# Install dependencies
RUN npm install

# Install the Playwright browsers
RUN npx playwright install

# Command to run your script
CMD ["node", "main.js"]
