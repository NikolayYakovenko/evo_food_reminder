FROM node:12.19.0-alpine AS BUILD_IMAGE

# Create app directory
ENV CODE_DIR "/app"
WORKDIR $CODE_DIR

# Install app dependencies
COPY package*.json $CODE_DIR/
RUN npm install

# Bundle app source
COPY webpack.config.js server.js .eslintrc .babelrc $CODE_DIR/
COPY models/ $CODE_DIR/models
COPY src/ $CODE_DIR/src

RUN npm run build

# remove development dependencies
RUN npm prune --production

#COPY ./dist /app/build

FROM node:12.19.0-alpine

ENV CODE_DIR "/app"
WORKDIR $CODE_DIR

# copy from build image
COPY --from=BUILD_IMAGE $CODE_DIR/dist ./dist
COPY --from=BUILD_IMAGE $CODE_DIR/package.json .
COPY --from=BUILD_IMAGE $CODE_DIR/server.js .
COPY --from=BUILD_IMAGE $CODE_DIR/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]

