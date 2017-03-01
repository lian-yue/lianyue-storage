"use strict";
const path          = require('path')
const http          = require('http')
const assert        = require('assert')
const Koa           = require('koa')
const koaStatic     = require('koa-static')      // 静态文件

const options = require('../options')
const thumbnail = require('./thumbnail')

// Add http 451
http.STATUS_CODES[451] = 'Unavailable For Legal Reasons';
http.STATUS_CODES[499] = 'Request aborted';

const app = new Koa();

app.env = process.env.NODE_ENV || 'development';



// error
app.context.onerror = function(err) {
  if (null == err) {
    return;
  }
  assert(err instanceof Error, 'non-error thrown: ' + err);
  var ctx = this;

  // ENOENT support
  if ('ENOENT' === err.code) {
    err.status = 404;
  }

  if (err.status == 400 && err.statusCode > 400 && err.statusCode < 500) {
    err.status = err.status;
  }

  if ((err.code == 'HPE_INVALID_EOF_STATE' || err.code == 'ECONNRESET') && !err.status) {
    err.status = 499;
  }

  if ('number' !== typeof err.status || !http.STATUS_CODES[err.status]) {
    err.status = 500;
  }

  ctx.app.emit('error', err, ctx);

  if (err.status == 499) {
    return;
  }

  if (ctx.headerSent || !ctx.writable) {
    err.headerSent = true;
    return;
  }

  if (!ctx.status || ctx.status < 300 || ctx.status == 404) {
    ctx.status = err.status;
  }

  ctx.set(err.headers);
  ctx.body  = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Error</title></head><body><h1>${err.message}</h1></body></html>`;
  ctx.res.end(ctx.body);
};





// storage
app.use(koaStatic(options.original));

// thumbnail
app.use(koaStatic(options.thumbnail));

// access log
app.use(async function(ctx, next) {
  var start = new Date;
  await next()
  var ms = new Date - start;
  var userAgent = ctx.request.header['user-agent'] || '';
  console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms - ${ctx.ip} - ${userAgent}`);
});


// thumbnail
app.use(thumbnail);


// 错误捕获
app.on('error', function(err, ctx) {
  if (err.status >= 500) {
    console.error('server error :', err, ctx);
  } else {
    console.warn(`${ctx.method} ${ctx.status} ${ctx.url} - ${ctx.request.ip} - ${err.message}`);
  }
});

module.exports = app;
