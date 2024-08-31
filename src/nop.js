function _onRequestError(req, reply, err) {
  if (err.code === "ERR_INVALID_URL") return reply.code(400).send("Invalid URL");

  // When there's a real error, redirect then destroy the stream immediately.
  redirect(req, reply);
  console.error(err);
}

function _onRequestResponse(origin, req, reply) {
  if (origin.statusCode >= 400) return redirect(req, reply);

  // handle redirects
  if (origin.statusCode >= 300 && origin.headers.location) return redirect(req, reply);

  copyHeaders(origin, reply);
  reply.header("content-encoding", "identity");
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Cross-Origin-Resource-Policy", "cross-origin");
  reply.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  req.params.originType = origin.headers["content-type"] || "";
  req.params.originSize = origin.headers["content-length"] || "0";

  origin.body.on('error', _ => req.socket.destroy());

  if (shouldCompress(req)) {
    // sharp supports stream, so pipe it.
    return compress(req, reply, origin);
  } else {
    // For cases where we bypass compression.
    reply.header("x-proxy-bypass", 1);

    for (const headerName of ["accept-ranges", "content-type", "content-length", "content-range"]) {
      if (headerName in origin.headers) {
        reply.header(headerName, origin.headers[headerName]);
      }
    }

    return origin.body.pipe(reply.raw);
  }
}

module.exports = proxy;
