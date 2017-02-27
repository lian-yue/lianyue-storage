import fs from 'fs'
import path from 'path'

import send from 'koa-send'
import options from '../options'

const gm = require('gm').subClass({imageMagick: true});



function fileExists(pathname) {
  return new Promise((resolve, reject) => {
    fs.exists(pathname, (exists) => {
      resolve(exists);
    });
  });
}



function mkdirPromise(dir) {
  const mkdir = (dir, callback)  => {
    fs.exists(dir, (exists) => {
      if (exists) {
        callback(null);
        return;
      }

      mkdir(path.dirname(dir), (err) => {
        fs.mkdir(dir, 0o755, (err) => {
          if (err && err.code != 'EEXIST') {
            callback(err);
            return;
          }
          callback(null);
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    mkdir(dir, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}



function thumbnailPromise(original, thumbnail, args, extension) {
  return new Promise((resolve, reject) => {

    var image = gm(original + (extension == 'gif' ? '' : '[0]'));
    image.size((err, size) => {
      if (err) {
        resolve(err);
        return;
      }
      var srcWidth = size.width
      var srcHeight = size.height


      if (args[2]) {
        let dstWidth = args[0]
  			let dstHeight = args[1]
        let sizeRatio = Math.min(srcWidth / dstWidth, srcHeight / dstHeight)
        let width = dstWidth * sizeRatio
  			let height = dstHeight * sizeRatio

        let x
        let y
        switch (args[2]) {
          case 1:
            x = 0
            y = 0
            break
          case 2:
            x = (srcWidth - width) / 2
            y = 0
            break
          case 3:
            x = srcWidth - width
            y = 0
            break
          case 4:
            x = 0
            y = (srcHeight - height) / 2
            break
          case 5:
            x = (srcWidth - width) / 2
            y = (srcHeight - height) / 2
            break
          case 6:
            x = srcWidth - width
            y = (srcHeight - height) / 2
            break;
          case 7:
            x = 0
            y = srcHeight - height
            break
          case 8:
            x = (srcWidth - width) / 2
            y = srcHeight - height
            break
          case 9:
            x = srcWidth - width
            y = srcHeight - height
            break
          default:
            x = (srcWidth - width) / 2
            y = (srcHeight - height) / 2
        }

        image.crop(Math.round(width), Math.round(height), Math.round(x), Math.round(y))

        srcWidth = width;
        srcHeight = height;
      }

      var width;
      var height;
      if (!args[0] && !args[1]) {
        width = srcWidth
        height = srcHeight
      } else if (args[0] && !args[1]) {
        width = args[0]
        height = srcHeight / (srcWidth / width)
      } else  if (!args[0] && args[1]) {
        height = args[1]
        width = srcWidth / (srcHeight / height)
      } else {
        width = args[0]
        height = args[1]
      }

      var pos = ['NorthWest', 'North', 'NorthEast', 'West', 'Center', 'East', 'SouthWest', 'South', 'SouthEast'];
      if (args[2]) {
        image = image.resize(Math.ceil(width), Math.ceil(height), args[3] ? '' : '>')
        image.gravity(pos[args[2]-1]);
        if (args[3]) {
          image.extent(args[0] || Math.round(width), args[1] || Math.round(height));
        }
      } else {
        image.resize(Math.round(width), Math.round(height), args[3] ? '' : '>')
      }


      /*var srcWidth = size.width
      var srcHeight = size.height


      var width;
      var height;
      if (!args[0] && !args[1]) {
        width = srcWidth
        height = srcHeight
      } else if (args[0] && !args[1]) {
        width = args[0]
        height = srcHeight / (srcWidth / width)
      } else  if (!args[0] && args[1]) {
        height = args[1]
        width = srcWidth / (srcHeight / height)
      } else if (!args[2]) {
        width = args[0]
        height = args[1]
      } else {
        let sizeRatio = Math.max(srcWidth / args[0], srcHeight / args[1])
        width = srcWidth / sizeRatio
  			height = srcHeight / sizeRatio
      }

      console.log(width, height);


      var pos = ['NorthWest', 'North', 'NorthEast', 'West', 'Center', 'East', 'SouthWest', 'South', 'SouthEast'];
      if (args[2]) {
        image = image.resize(Math.ceil(width), Math.ceil(height), args[3] ? '' : '>')
        image.gravity(pos[args[2]-1]);
        if (args[3]) {
          image.extent(args[0], args[1]);
        }
      } else {
        image.resize(Math.round(width), Math.round(height), args[3] ? '' : '>')
      }*/

      image
        .background('#000000')
        .autoOrient()
        .noProfile()
        .quality(90)
        .setFormat('png')
        .setFormat(extension == 'jpg' ? 'jpeg' : extension)


      image.write(thumbnail, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });

  });
}

    /*var image = sharp(original);
    image.metadata().then((metadata) => {
      var width = args[0] || null
      var height = args[1] || null

      if (!args[3]) {
        if (width && width > metadata.width) {
          width = metadata.width;
        }
        if (height && height > metadata.height) {
          height = metadata.height;
        }
      }
      image.resize(width, height);
      // switch (args[3]) {
      //   case 1:
      //     image = image.crop(sharp.gravity.north);
      //     break;
      //   case 2:
      //
      //     break;
      //   case 3:
      //
      //     break;
      //   case 4:
      //
      //     break;
      //   case 5:
      //
      //     break;
      //   case 6:
      //
      //     break;
      //   case 7:
      //
      //     break;
      //   case 8:
      //
      //     break;
      //   case 9:
      //
      // }
      image
      .toFormat(extension == 'jpg' ? 'jpeg' : extension)
      .quality(90)
      .toFile(thumbnail, function(err, info) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });;
    })
  })
}
*/


export default async function(ctx, next) {
  var pathname = ctx.path;
  try {
    pathname = decodeURIComponent(pathname);
  } catch (err) {
    return ctx.throw('failed to decode', 400);
  }

  pathname = pathname.split('/')
  pathname.shift()
  for (let name of pathname) {
    if (!name || name.substr(0, 1) == '.' || name.substr(-1, 1) == '.' || name.indexOf('..') != -1) {
      await next()
      return
    }
    if (!(/^[0-9a-zA-Z._!-]+$/.test(name))) {
      await next()
      return
    }
  }

  var filename = pathname.pop().split('!')
  if (!(/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(filename[0]))) {
    await next()
    return
  }
  pathname.push(filename[0])
  pathname = pathname.join('/')

  if (filename.length != 2 || !filename[0] || !filename[1]) {
    await next()
    return
  }


  var args = filename[1].split('_')
  if (args.length != 4) {
    await next()
    return
  }
  var extensions = args[3].split('.')
  if (extensions.length != 2) {
    await next()
    return
  }

  args[3] = extensions[0];
  var extension = extensions[1];

  if (['jpg', 'jpeg', 'gif', 'png', 'webp'].indexOf(extension) == -1) {
    await next()
    return
  }

  if (args[3] != '0' && args[3] != '1') {
    await next()
    return
  }

  args[3] = parseInt(args[3]);

  if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(args[2]) == -1) {
    await next()
    return
  }
  args[2] = parseInt(args[2]);

  if (!(/^(0|[1-9][0-9]*)$/.test(args[0])) || !(/^(0|[1-9][0-9]*)$/.test(args[1]))) {
    await next()
    return
  }

  args[1] = parseInt(args[1]);
  args[0] = parseInt(args[0]);

  if (isNaN(args[0]) || isNaN(args[1]) || args[0] < 0 || args[1] < 0 || args[0] > 4096 || args[1] > 4096) {
    await next()
    return
  }

  if (args[2] && (!args[0] || !args[1])) {
    await next()
    return
  }

  if (!options.filters(args[0], args[1], args[2], args[3], extension)) {
    await next()
    return
  }

  var sendPath = '/'+ pathname + '!' + args.join('_') + '.' + extension;
  var original = path.join(options.original + '/'+ pathname);
  var thumbnail = path.join(options.thumbnail, sendPath)
  var exists = await fileExists(original);
  if (!exists) {
    await next()
    return
  }

  await mkdirPromise(path.dirname(thumbnail))

  await thumbnailPromise(original, thumbnail, args, extension)

  await send(ctx, sendPath, {root: options.thumbnail})
}
