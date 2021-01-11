# Set node version
FROM node:14

# App directory
WORKDIR /usr/src
COPY package.json .
RUN npm install --only=prod

# Copy all and build ts files
COPY . .
RUN npm run build

# Run app
CMD ["npm", "start"]
