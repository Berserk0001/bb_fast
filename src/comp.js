"use strict";
/*
 * compress.js
 * A module that compress an image.
 * compress(httpRequest, httpResponse, ReadableStream);
 */
const sharp = require('sharp');
const redirect = require('./redirect');

const sharpStream = () => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

function compress(req, reply, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  input.body.pipe(
    sharpStream()
      .grayscale(req.params.grayscale)
      .toFormat(format, {
        quality: req.params.quality,
        progressive: true,
        optimizeScans: true
      })
      .toBuffer((err, output, info) => {
        if (err || !info) {
          return redirect(req, reply);
        }

        reply
          .header('content-type', 'image/' + format)
          .header('content-length', info.size)
          .header('x-original-size', req.params.originSize)
          .header('x-bytes-saved', req.params.originSize - info.size)
          .code(200)
          .send(output);
      })
  );
}

module.exports = compress;
