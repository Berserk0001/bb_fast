#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({
  logger: true,
  trustProxy: true  // Enables trust proxy, similar to Express's `app.enable('trust proxy')`
});
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Middleware to parse query parameters and set request params
fastify.addHook('preHandler', params);

// Default route for handling image requests
fastify.get('/', proxy);

// Handling favicon requests, responding with 204 No Content
fastify.get('/favicon.ico', (req, reply) => reply.code(204).send());

// Start the server
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
