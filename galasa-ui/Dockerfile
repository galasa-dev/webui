# Define the base image
FROM node:18-alpine AS base

#-----------------------------------------------------------------------------------------------
# Build stage - installs required dependencies and builds the webui artifacts.
FROM base AS build

# Our application sits in the the following folder...
WORKDIR /home/galasa

COPY package*.json ./

# Install the application's dependencies
RUN npm clean-install --omit=dev

# Note: The .dockerignore stops us copying any node_modules which are on the local system.
COPY . .

# Just run the build. Doing it inside the docker image build so we use linux OS to do the build...
# in case it adds linux-specific things in there...
RUN npm run build

#-----------------------------------------------------------------------------------------------
# Application stage - copies build artifacts from the build stage and runs the webui application.
# Note: this is the only stage that will be included in the final image.
FROM base AS app

# Some libraries may apply production optimisations when NODE_ENV is set to "production"
ENV NODE_ENV=production

WORKDIR /home/galasa

# Set up the filesystem so that it is owned by the non-root node user
RUN mkdir -p /home/galasa && chown -R node:node /home/galasa

# Take advantage of Next.js' automatic file tracing to reduce image size
# See https://nextjs.org/docs/app/api-reference/next-config-js/output for information.
COPY --from=build --chown=node:node /home/galasa/.next/standalone ./
COPY --from=build --chown=node:node /home/galasa/.next/static ./.next/static

# Never run anything in a docker container as the root user if you can help it.
# Node images provide a non-root "node" user and group, so use that.
USER node

EXPOSE 8080
ENV PORT 8080

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
