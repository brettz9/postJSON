global.self = global;
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));
var encoding = _interopDefault(require('encoding'));
var http = _interopDefault(require('http'));
var url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

/*! (c) 2013-2018 Andrea Giammarchi (ISC) */
/**
 * Fully inspired by the work of John Gruber
 * <http://daringfireball.net/projects/markdown/>
 */
for (var
  isNodeJS = typeof process === 'object' && !process.browser,
  parse = isNodeJS ?
    // on NodeJS simply fallback to echomd
    (function (echomd, map) {
      function parse(value) {
        return typeof value === 'string' ?
          echomd(value) : value;
      }
      return function () {
        return map.call(arguments, parse);
      };
    }(require('echomd').raw, [].map)) :
    // on browsers implement some %cmagic%c
    // The current algorithm is based on two passes:
    //  1. collect all info ordered by string index
    //  2. transform surrounding with special %c chars
    // Info are grouped together whenever is possible
    // since the console does not support one style per %c
    (function () {
      return function (txt) {
        var
          code = (Object.create || Object)(null),
          multiLineCode = transform.multiLineCode.re,
          singleLineCode = transform.singleLineCode.re,
          storeAndHide = function ($0, $1, $2, $3) {
            $3 = $3.replace(/%c/g, '%%c');
            return $1 + $2 + (code[$3] = md5Base64($3)) + $2;
          },
          restoreHidden = function ($0, $1, $2, $3) {
            return $1 + '%c' + getSource($3, code) + '%c';
          },
          out = [],
          args, i, j, length, css, key
        ;

        // match and hide possible code (which should not be parsed)
        match(txt, 'multiLineCode', out);
        txt = txt.replace(multiLineCode, storeAndHide);
        match(txt, 'singleLineCode', out);
        txt = txt.replace(singleLineCode, storeAndHide);

        // find all special cases preserving the order
        // in which are these found
        match(txt, 'header2', out);
        match(txt, 'header1', out);
        match(txt, 'blink', out);
        match(txt, 'bold', out);
        match(txt, 'dim', out);
        match(txt, 'hidden', out);
        match(txt, 'reverse', out);
        match(txt, 'strike', out);
        match(txt, 'underline', out);
        match(txt, 'color', out);

        // transform using all info

        // - - - or ___ or * * * with or without space in between
        txt = txt.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm, line);

        // ## Header
        txt = replace(txt, 'header2');

        // # Header
        txt = replace(txt, 'header1');

        // :blink: *bold* -dim- ?hidden? !reverse! _underline_ ~strike~
        txt = replace(txt, 'blink');
        txt = replace(txt, 'bold');
        txt = replace(txt, 'dim');
        txt = replace(txt, 'hidden');
        txt = replace(txt, 'reverse');
        txt = replace(txt, 'strike');
        txt = replace(txt, 'underline');

        //    * list bullets
        txt = txt.replace(/^([ \t]{1,})[*+-]([ \t]{1,})/gm, '$1•$2');

        // > simple quotes
        txt = txt.replace(/^[ \t]*>([ \t]?)/gm, function ($0, $1) {
          return Array($1.length + 1).join('▌') + $1;
        });

        // #RGBA(color) and !#RGBA(background-color)
        txt = replace(txt, 'color');

        // cleanup duplicates
        txt = txt.replace(/(%c)+/g, '%c');

        // put back code
        txt = txt.replace(singleLineCode, restoreHidden);
        txt = txt.replace(multiLineCode, restoreHidden);

        // create list of arguments to style the console
        args = [txt];
        length = out.length;
        for (i = 0; i < length; i++) {
          css = '';
          key = '';
          // group styles by type (start/end)
          for (j = i; j < length; j++) {
            i = j;  // update the i to move fast-forward
            if (j in out) {
              // first match or same kind of operation (start/end)
              if (!key || (key === out[j].k)) {
                key = out[j].k;
                css += out[j].v;
              } else {
                i--;  // if key changed, next loop should update
                break;
              }
            }
          }
          if (css) args.push(css);
        }
        return args;
      };
    }())
  ,
  line = Array(33).join('─'),
  // just using same name used in echomd, not actual md5
  md5Base64 = function (txt) {
    for (var out = [], i = 0; i < txt.length; i++) {
      out[i] = txt.charCodeAt(i).toString(32);
    }
    return out.join('').slice(0, txt.length);
  },
  getSource = function (hash, code) {
    for (var source in code) {
      if (code[source] === hash) {
        return source;
      }
    }
  },
  commonReplacer = function ($0, $1, $2, $3) {
    return '%c' + $2 + $3 + '%c';
  },
  match = function (txt, what, stack) {
    var info = transform[what], i, match;
    while (match = info.re.exec(txt)) {
      i = match.index;
      stack[i] = {
        k: 'start',
        v: typeof info.start === 'string' ?
          info.start : info.start(match)
      };
      i = i + match[0].length - 1;
      stack[i] = {
        k: 'end',
        v: typeof info.end === 'string' ?
          info.end : info.end(match)
      };
    }
  },
  replace = function (txt, what) {
    var info = transform[what];
    return txt.replace(info.re, info.place);
  },
  transform = {
    blink: {
      re: /(\:{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'padding:0 2px;border:1px solid darkslategray;text-shadow:0 0 2px darkslategray;',
      end: 'padding:none;border:none;text-shadow:none;'
    },
    bold: {
      re: /(\*{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'font-weight:bold;',
      end: 'font-weight:default;'
    },
    color: {
      re: /(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g,
      place: function ($0, bg, rgb, txt) {
        return '%c' + txt + '%c';
      },
      start: function (match) {
        return (match[1] ? 'background-' : '') + 'color:' +
              (/^[a-fA-F0-9]{3,8}$/.test(match[2]) ? '#' : '') +
              match[2] + ';';
      },
      end: function (match) {
        return (match[1] ? 'background-' : '') + 'color:initial;';
      }
    },
    dim: {
      re: /(-{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'color:dimgray;',
      end: 'color:none;'
    },
    header1: {
      re: /^(\#[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
      place: commonReplacer,
      start: 'font-weight:bold;font-size:1.6em;',
      end: 'font-weight:default;font-size:default;'
    },
    header2: {
      re: /^(\#{2,6}[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
      place: commonReplacer,
      start: 'font-weight:bold;font-size:1.3em;',
      end: 'font-weight:default;font-size:default;'
    },
    hidden: {
      re: /(\?{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'color:rgba(0,0,0,0);',
      end: 'color:none;'
    },
    reverse: {
      re: /(\!{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'padding:0 2px;background:darkslategray;color:lightgray;',
      end: 'padding:none;background:none;color:none;'
    },
    multiLineCode: {
      re: /(^|[^\\])(`{2,})([\s\S]+?)\2(?!`)/g,
      start: 'font-family:monospace;',
      end: 'font-family:default;'
    },
    singleLineCode: {
      re: /(^|[^\\])(`)(.+?)\2/gm,
      start: 'font-family:monospace;',
      end: 'font-family:default;'
    },
    strike: {
      re: /(~{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'text-decoration:line-through;',
      end: 'text-decoration:default;'
    },
    underline: {
      re: /(_{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'border-bottom:1px solid;',
      end: 'border-bottom:default;'
    }
  },
  // 'error', 'info', 'log', 'warn' are overwritten
  // it is possible to use original method at any time
  // simply accessing console.methodName.raw( ... ) instead
  overwrite = function (method) {
    var original = console[method];
    if (original) (consolemd[method] = isNodeJS ?
      function () {
        return original.apply(console, parse.apply(null, arguments));
      } :
      function () {
        var singleStringArg = arguments.length === 1 && typeof arguments[0] === 'string';
        var args = singleStringArg ? parse(arguments[0]) : arguments;

        // Todo: We might expose more to the reporter (e.g., returning
        //   `what` and `match` from the `parse`->`match` function) so
        //   the user could, e.g., build spans with classes rather than
        //   inline styles
        if (_reporter) {
          var
            lastIndex, resultInfo,
            msg = args[0],
            formattingArgs = args.slice(1),
            formatRegex = /%c(.*?)(?=%c|$)/g,
            tmpIndex = 0;
          _reporter.init();
          while ((resultInfo = formatRegex.exec(msg)) !== null) {
            var lastIndex = formatRegex.lastIndex;
            var result = resultInfo[0];
            if (result.length > 2) { // Ignore any empty %c's
              var beginningResultIdx = lastIndex - result.length;
              if (beginningResultIdx > tmpIndex) {
                var text = msg.slice(tmpIndex, beginningResultIdx);
                _reporter.report(text);
              }
              _reporter.report(result.slice(2), formattingArgs.splice(0, 1)[0]);
            }
            tmpIndex = lastIndex;
          }
          if (tmpIndex < msg.length) {
            var text = msg.slice(tmpIndex);
            _reporter.report(text);
          }
          _reporter.done(args);
        }
        return original.apply(console, args);
      }).raw = function () {
        return original.apply(console, arguments);
      };
  },
  consolemd = {},
  methods = ['error', 'info', 'log', 'warn'],
  key,
  i = 0; i < methods.length; i++
) {
  overwrite(methods[i]);
}
// if this is a CommonJS module
try {
  overwrite = function (original) {
    return function () {
      return original.apply(console, arguments);
    };
  };
  for (key in console) {
    if (!consolemd.hasOwnProperty(key)) {
      consolemd[key] = overwrite(console[key]);
    }
  }
} catch(e) {
  // otherwise replace global console methods
  for (i = 0; i < methods.length; i++) {
    key = methods[i];
    if (!console[key].raw) {
      console[key] = consolemd[key];
    }
  }
}

var _reporter = null;
var addReporter = function (reporter) {
  _reporter = reporter;
};

class HTMLReporter {
  constructor (context, opts) {
    opts = opts || {};
    this.context = context || document.body;
    this.allowHTML = opts.allowHTML;
  }
  init () {
    this.container = document.createElement('li');
  }
  report (text, styles) {
    if (styles) {
      var span = document.createElement('span');
      span.setAttribute('style', styles);
      span[this.allowHTML ? 'innerHTML' : 'textContent'] = text;
      this.container.append(span);
    } else {
      this.container.append(text);
    }
  }
  done (args) {
    // this.context.append(JSON.stringify(args));
    this.context.append(this.container);
  }
}

/*! (C) 2017 Andrea Giammarchi & Claudio D'angelis */

// used to assert conditions
// equivalent of console.assert(...args)
// tressa(true)
// tressa(true, 'what am I testing')
function tressa(condition, message) {
  try {
    console.assert.apply(console, arguments);
    // in order to read or know failures on browsers
    if (!condition) tressa.exitCode = 1;
    if (typeof message === 'string' && condition) {
      tressa.console.log('#green(✔) ' + message);
    }
  } catch(error) {
    tressa.exitCode = 1;
    tressa.console.error('#red(✖) ' + error);
  }
}

// on top of the test to show a nice title
// test.title('My Library');
tressa.title = function (title) {
  tressa.testName = title;
  tressa.console.info('# ' + title);
  console.time(title);
};

// for asynchronous tests
/*
tressa.async(done => {
  // later on ...
  tressa(1);
  setTimeout(() => {
    tressa(2);
    done();
  });
});
*/
tressa.async = function (fn, timeout) {
  var
    resolve = Object,
    reject = Object,
    timer = setTimeout(
      function () {
        var reason = '*timeout (' + (timeout || tressa.timeout) + 'ms)* ' + (fn.name || fn);
        reject(reason);
        tressa(false, reason);
      },
      timeout || tressa.timeout
    )
  ;
  setTimeout(function () {
    fn(function () {
      resolve.apply(null, arguments);
      clearTimeout(timer);
    });
  });
  return typeof Promise !== 'undefined' ?
    new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    }) :
    null;
};

// default expiring timeout
tressa.timeout = 10000;

// for synchronous tests (alias)
tressa.assert = tressa.sync = tressa;

// to log Markdown like strings
tressa.console = consolemd;

tressa.log = tressa.console.log;

// to end on browsers
tressa.end = function () {
  var title = tressa.testName;
  if (title) {
    tressa.console.log(Array(title.length + 10).join('─'));
    console.timeEnd(title);
    tressa.console.log('');
    tressa.testName = '';
  }
};

try {
  // show stats on exit, if any, on node
  if (!process.browser) {
    process.on('exit', function () {
      tressa.end();
      process.exit(tressa.exitCode || 0);
    });
    process.on('uncaughtException', function (error) {
      tressa.exitCode = 1;
      tressa.console.error('#red(✖) ' + error);
      process.emit('exit');
    });
  }
} catch(o_O) {}

const addHTMLReporter = function (context, opts) {
  addReporter(new HTMLReporter(context, opts));
};

function htmlReporter (context = document.body, {allowHTML = true} = {}) {
  const {assert, time, timeEnd} = console;

  // Keep track of timers ourselves (only approximate to that in console)
  const htmlMsg = ({element, text, backgroundColor, textColor}) => {
    const elem = document.createElement(element || 'span');
    elem[allowHTML ? 'innerHTML' : 'textContent'] = text;
    if (backgroundColor) elem.style.backgroundColor = backgroundColor;
    if (textColor) elem.style.color = textColor;
    return elem;
  };
  const htmlWarn = (msg) => {
    const warning = htmlMsg({
      text: msg,
      backgroundColor: 'lightyellow',
      textColor: 'black'
    });
    context.append(warning, document.createElement('br'));
  };
  const htmlLog = (msg) => {
    const log = htmlMsg({
      text: msg
    });
    context.append(log, document.createElement('br'));
  };
  const timers = {};
  console.time = function (label) {
    if (label in timers) {
        htmlWarn(`Timer "${label}" already exists.`);
        return;
    }
    timers[label] = new Date();
    return time.apply(console, arguments);
  };
  console.timeEnd = function (label) {
    if (!(label in timers)) {
      htmlWarn(`Timer "${label}" doesn't exist.`);
      return;
    }
    var elapsed = new Date() - timers[label];
    htmlLog(`${label}: ${elapsed}ms`);
    delete timers[label];
    return timeEnd.apply(console, arguments);
  };
  console.assert = function (passed, stringOrObj, ...args) {
    if (!passed) {
      if (!stringOrObj || typeof stringOrObj !== 'object') {
        const assertionFailed = htmlMsg({
          text: 'Assertion failed: ',
          backgroundColor: 'lightpink',
          textColor: 'purple'
        });
        const message = htmlMsg({
          text: stringOrObj === undefined ? '' : stringOrObj,
          textColor: 'deeppink'
        });
        assertionFailed.append(message);
        context.append(assertionFailed, document.createElement('br'));
      }
    }
    return assert.apply(console, arguments);
  };
}

const mocha = {
  setup ({ui, $context, $allowHTML}) {
    if (ui === 'tdd') {
      addHTMLReporter($context, {allowHTML: $allowHTML});
      htmlReporter($context, {allowHTML: $allowHTML});
    }
    // else if (ui === 'bdd') { } // Todo
  }
};

async function iterateGroups (innerGroups) {
  await innerGroups.reduce(
    async (p, {title: groupTitle, beforeEachs, afterEachs, its, innerGroups}) => {
      await p;
      const parentCtx = {};
      function labelAndFn (context, beforeFunction, afterFunction) {
        return async function (p, {title, fn}) {
          await p;
          let finished = false;
          let res, rej;
          function done (rejected) {
            finished = true;
            if (rej && rejected !== undefined) {
              rej(); // rejected
              return;
            }
            if (res) {
              res(title);
            }
          }
          if (beforeFunction) {
            await beforeFunction(title);
          }
          const ret = fn.call(context, done);
          if (ret && ret.then) {
            await ret;
          } else if (fn.length && !finished) {
            await new Promise((resolve, reject) => {
              res = resolve;
              rej = reject;
            });
          }
          if (afterFunction) {
            await afterFunction(title);
          }
        };
      }

      tressa.log(`## ${groupTitle}`);

      if (!its.length) {
        await beforeEachs.reduce(labelAndFn(parentCtx, (beforeEachTitle) => {
          tressa.log(`_beforeEach_: ${beforeEachTitle}`);
        }), Promise.resolve());
      } else {
        await its.reduce(labelAndFn({
          // Test context
          test: {
            parent: {
              ctx: parentCtx
            }
          }
        }, async (testTitle) => {
          await beforeEachs.reduce(labelAndFn(parentCtx, (beforeEachTitle) => {
            tressa.log(`_beforeEach_: ${beforeEachTitle}`);
          }), Promise.resolve());
          tressa.log(`**TEST**: ${testTitle}`);
        }, async () => {
          await afterEachs.reduce(labelAndFn(parentCtx, (afterEachTitle) => {
            tressa.log(`_afterEach_: ${afterEachTitle}`);
          }), Promise.resolve());
        }), Promise.resolve());
        // Test code will do its own logging as well
      }
      if (!its.length) {
        await afterEachs.reduce(labelAndFn(parentCtx, (afterEachTitle) => {
          tressa.log(`_afterEach_: ${afterEachTitle}`);
        }), Promise.resolve());
      }

      await iterateGroups(innerGroups);
    }, Promise.resolve()
  );
}

const testGroups = {innerGroups: []};
let referenceTestGroup = testGroups;

function describe (title, groupFn) {
  const firstRun = !testGroups.innerGroups.length;

  referenceTestGroup.innerGroups.push({
    title,
    beforeEachs: [],
    afterEachs: [],
    its: [],
    innerGroups: []
  });

  const lastReferenceTestGroup = referenceTestGroup;
  referenceTestGroup = referenceTestGroup.innerGroups[referenceTestGroup.innerGroups.length - 1];
  groupFn();
  referenceTestGroup = lastReferenceTestGroup;

  if (firstRun) {
    setTimeout(async () => {
      // console.log('testGroups', testGroups);
      tressa.title(typeof document !== 'undefined' ? document.title : 'Node tests');
      await iterateGroups(testGroups.innerGroups);
      tressa.end();
    });
  }
}

function it (title, fn) {
  referenceTestGroup.its.push({
    title: (fn && title) || '',
    fn: fn || title
  });
}

// We don't want to expose the whole API now in case we use more of Mocha/Chai's assert API
const assert = tressa.sync.bind(tressa);

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

/**
 * body.js
 *
 * Body interface provides common methods for Request and Response
 */



var _require = stream;

const PassThrough = _require.PassThrough;


let convert;
try {
	convert = encoding.convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (typeof body === 'string') ; else if (isURLSearchParams(body)) ; else if (body instanceof Blob) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') ; else if (body instanceof stream) ; else {
		// none of the above
		// coerce to string
		body = String(body);
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof stream) {
		body.on('error', function (err) {
			_this[INTERNALS].error = new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}

};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	// body is null
	if (this.body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is string
	if (typeof this.body === 'string') {
		return Body.Promise.resolve(Buffer.from(this.body));
	}

	// body is blob
	if (this.body instanceof Blob) {
		return Body.Promise.resolve(this.body[BUFFER]);
	}

	// body is buffer
	if (Buffer.isBuffer(this.body)) {
		return Body.Promise.resolve(this.body);
	}

	// body is buffer
	if (Object.prototype.toString.call(this.body) === '[object ArrayBuffer]') {
		return Body.Promise.resolve(Buffer.from(this.body));
	}

	// istanbul ignore if: should never happen
	if (!(this.body instanceof stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream error, such as incorrect content-encoding
		_this4.body.on('error', function (err) {
			reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
		});

		_this4.body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		_this4.body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Response or Request instance
 */
function extractContentType(instance) {
	const body = instance.body;

	// istanbul ignore if: Currently, because of a guard in Request, body
	// can never be null. Included here for completeness.

	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (body instanceof Blob) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is array buffer
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else {
		// body is stream
		// can't really do much about this
		return null;
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;

	// istanbul ignore if: included for completion

	if (body === null) {
		// body is null
		return 0;
	} else if (typeof body === 'string') {
		// body is string
		return Buffer.byteLength(body);
	} else if (isURLSearchParams(body)) {
		// body is URLSearchParams
		return Buffer.byteLength(String(body));
	} else if (body instanceof Blob) {
		// body is blob
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is array buffer
		return body.byteLength;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		// can't really do much about this
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (typeof body === 'string') {
		// body is string
		dest.write(body);
		dest.end();
	} else if (isURLSearchParams(body)) {
		// body is URLSearchParams
		dest.write(Buffer.from(String(body)));
		dest.end();
	} else if (body instanceof Blob) {
		// body is blob
		dest.write(body[BUFFER]);
		dest.end();
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is array buffer
		dest.write(Buffer.from(body));
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = commonjsGlobal.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name)) {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

/**
 * response.js
 *
 * Response class provides content decoding
 */



const STATUS_CODES = http.STATUS_CODES;


const INTERNALS$1 = Symbol('Response internals');

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers: new Headers(opts.headers)
		};
	}

	get url() {
		return this[INTERNALS$1].url;
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * request.js
 *
 * Request class contains server only options
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */



const format_url = url.format;
const parse_url = url.parse;


const INTERNALS$2 = Symbol('Request internals');

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (init.body != null) {
			const contentType = extractContentType(this);
			if (contentType !== null && !headers.has('Content-Type')) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}
	if (!headers.has('Connection') && !request.agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent: request.agent
	});
}

/**
 * index.js
 *
 * a request API compatible with window.fetch
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */

const http$$1 = http;


var _require$3 = stream;

const PassThrough$1 = _require$3.PassThrough;

var _require2 = url;

const resolve_url = _require2.resolve;



/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url$$1, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url$$1, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http$$1).request;

		// send request
		const req = send(options);
		let reqTimeout;

		function finalize() {
			req.abort();
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							headers.set('Location', locationURL);
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			let body = res.pipe(new PassThrough$1());
			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				resolve(new Response(body, response_options));
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				resolve(new Response(body, response_options));
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					resolve(new Response(body, response_options));
				});
				return;
			}

			// otherwise, use response as-is
			resolve(new Response(body, response_options));
		});

		writeToStream(req, request);
	});
}

/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// Needed for TypeScript.
fetch.default = fetch;

// expose Promise
fetch.Promise = commonjsGlobal.Promise;

module.exports = exports = fetch;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;
});

unwrapExports(lib);
var lib_1 = lib.Headers;
var lib_2 = lib.Request;
var lib_3 = lib.Response;
var lib_4 = lib.FetchError;

var nodePonyfill = createCommonjsModule(function (module, exports) {
var realFetch = lib.default || lib;

var fetch = function (url$$1, options) {
  // Support schemaless URIs on the server for parity with the browser.
  // Ex: //github.com/ -> https://github.com/
  if (/^\/\//.test(url$$1)) {
    url$$1 = 'https:' + url$$1;
  }
  return realFetch.call(this, url$$1, options);
};

fetch.polyfill = false;

module.exports = exports = fetch;
exports.fetch = fetch;
exports.Headers = lib.Headers;
exports.Request = lib.Request;
exports.Response = lib.Response;

// Needed for TypeScript.
exports.default = fetch;
});
var nodePonyfill_1 = nodePonyfill.fetch;
var nodePonyfill_2 = nodePonyfill.Headers;
var nodePonyfill_3 = nodePonyfill.Request;
var nodePonyfill_4 = nodePonyfill.Response;

commonjsGlobal.self = commonjsGlobal;

function _interopDefault$1 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch$1 = _interopDefault$1(nodePonyfill);

/* eslint-env browser */

function status (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}
function retrieval (response) {
  return response.json();
}
function postJSON (url$$1, bodyObject, cb, errBack) {
  const dataObject = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  let credentials = 'same-origin', statusCb = status, retrievalCb = retrieval;
  if (url$$1 && typeof url$$1 === 'object') {
    bodyObject = url$$1.body || bodyObject;
    cb = url$$1.callback || cb;
    errBack = url$$1.errBack || errBack;

    // Properties only available via this object argument API
    statusCb = url$$1.status || status;
    retrievalCb = url$$1.retrieval || retrieval;
    credentials = url$$1.credentials || credentials; // "omit" (default), "same-origin", "include"
    dataObject.headers = postJSON.objectAssign(dataObject.headers, url$$1.headers);

    url$$1 = url$$1.url;
  }
  if (bodyObject) {
    dataObject.body = JSON.stringify(bodyObject);
  }
  dataObject.credentials = credentials;
  let ret = (typeof fetch !== 'undefined' ? fetch : postJSON.fetch)(url$$1, dataObject).then(statusCb).then(retrievalCb);
  if (cb) {
    ret = ret.then(cb);
  }
  if (errBack) {
    ret = ret.catch(errBack);
  }
  return ret;
}
postJSON.retrieval = retrieval;
postJSON.status = status;

/* eslint-env node */

postJSON.fetch = fetch$1;

var indexCjs = postJSON;

if (typeof document !== 'undefined') {
  mocha.setup({ui: 'tdd', $context: document.querySelector('#results')}); // $allowHTML: true
}

describe('postJSON', function () {
  it('Can post JSON', async function () {
    const json = await indexCjs('http://localhost:8008/test/sample.json');
    assert(json && typeof json === 'object', 'Returns an object');
  });
});
