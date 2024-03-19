import http from 'http';
import https from 'https';
import * as defaults from './defaults.js';
import { externalRequest } from './external-request.js';

// options.path must be specified; callback(err, data)
function devToolsInterface(path, options, callback) {
  const transport = options.secure ? https : http;
  const requestOptions = {
    method: options.method,
    host: options.host || defaults.HOST,
    port: options.port || defaults.PORT,
    useHostName: options.useHostName,
    path: options.alterPath ? options.alterPath(path) : path,
  };
  externalRequest(transport, requestOptions, callback);
}

// wrapper that allows to return a promise if the callback is omitted, it works
// for DevTools methods
function promisesWrapper(func) {
  return (options, callback) => {
    // options is an optional argument
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    options = options || {};
    // just call the function otherwise wrap a promise around its execution
    if (typeof callback === 'function') {
      func(options, callback);
      return undefined;
    } else {
      return new Promise((fulfill, reject) => {
        func(options, (err, result) => {
          if (err) {
            reject(err);
          } else {
            fulfill(result);
          }
        });
      });
    }
  };
}

export const Protocol = promisesWrapper((options, callback) => {
  // if the local protocol is requested
  if (options.local) {
    import('./protocol.js').then((protocol) => {
      callback(null, protocol.default);
    });
    return;
  }
  // try to fetch the protocol remotely
  devToolsInterface('/json/protocol', options, (err, descriptor) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(descriptor));
    }
  });
});

export const List = promisesWrapper((options, callback) => {
  devToolsInterface('/json/list', options, (err, tabs) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(tabs));
    }
  });
});

export const New = promisesWrapper((options, callback) => {
  let path = '/json/new';
  if (Object.prototype.hasOwnProperty.call(options, 'url')) {
    path += `?${options.url}`;
  }
  options.method = options.method || 'PUT'; // see #497
  devToolsInterface(path, options, (err, tab) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(tab));
    }
  });
});

export const Activate = promisesWrapper((options, callback) => {
  devToolsInterface('/json/activate/' + options.id, options, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
});

export const Close = promisesWrapper((options, callback) => {
  devToolsInterface('/json/close/' + options.id, options, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
});

export const Version = promisesWrapper((options, callback) => {
  devToolsInterface('/json/version', options, (err, versionInfo) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(versionInfo));
    }
  });
});
