#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Registering the plugin to trust proxy
fastify.register(require('@fastify/forwarded'));

// Middleware to parse query parameters and set request params
fastify.addHook('preHandler', params);

// Default route
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
