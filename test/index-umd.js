(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  /*! (c) 2013-2018 Andrea Giammarchi (ISC) */

  /**
   * Fully inspired by the work of John Gruber
   * <http://daringfireball.net/projects/markdown/>
   */
  for (var isNodeJS = typeof process === 'object' && !process.browser, parse = isNodeJS ? // on NodeJS simply fallback to echomd
  function (echomd, map) {
    function parse(value) {
      return typeof value === 'string' ? echomd(value) : value;
    }

    return function () {
      return map.call(arguments, parse);
    };
  }(require('echomd').raw, [].map) : // on browsers implement some %cmagic%c
  // The current algorithm is based on two passes:
  //  1. collect all info ordered by string index
  //  2. transform surrounding with special %c chars
  // Info are grouped together whenever is possible
  // since the console does not support one style per %c
  function () {
    return function (txt) {
      var code = (Object.create || Object)(null),
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
          args,
          i,
          j,
          length,
          css,
          key; // match and hide possible code (which should not be parsed)


      match(txt, 'multiLineCode', out);
      txt = txt.replace(multiLineCode, storeAndHide);
      match(txt, 'singleLineCode', out);
      txt = txt.replace(singleLineCode, storeAndHide); // find all special cases preserving the order
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
      match(txt, 'color', out); // transform using all info
      // - - - or ___ or * * * with or without space in between

      txt = txt.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm, line); // ## Header

      txt = replace(txt, 'header2'); // # Header

      txt = replace(txt, 'header1'); // :blink: *bold* -dim- ?hidden? !reverse! _underline_ ~strike~

      txt = replace(txt, 'blink');
      txt = replace(txt, 'bold');
      txt = replace(txt, 'dim');
      txt = replace(txt, 'hidden');
      txt = replace(txt, 'reverse');
      txt = replace(txt, 'strike');
      txt = replace(txt, 'underline'); //    * list bullets

      txt = txt.replace(/^([ \t]{1,})[*+-]([ \t]{1,})/gm, '$1•$2'); // > simple quotes

      txt = txt.replace(/^[ \t]*>([ \t]?)/gm, function ($0, $1) {
        return Array($1.length + 1).join('▌') + $1;
      }); // #RGBA(color) and !#RGBA(background-color)

      txt = replace(txt, 'color'); // cleanup duplicates

      txt = txt.replace(/(%c)+/g, '%c'); // put back code

      txt = txt.replace(singleLineCode, restoreHidden);
      txt = txt.replace(multiLineCode, restoreHidden); // create list of arguments to style the console

      args = [txt];
      length = out.length;

      for (i = 0; i < length; i++) {
        css = '';
        key = ''; // group styles by type (start/end)

        for (j = i; j < length; j++) {
          i = j; // update the i to move fast-forward

          if ((j in out)) {
            // first match or same kind of operation (start/end)
            if (!key || key === out[j].k) {
              key = out[j].k;
              css += out[j].v;
            } else {
              i--; // if key changed, next loop should update

              break;
            }
          }
        }

        if (css) args.push(css);
      }

      return args;
    };
  }(), line = Array(33).join('─'), // just using same name used in echomd, not actual md5
  md5Base64 = function (txt) {
    for (var out = [], i = 0; i < txt.length; i++) {
      out[i] = txt.charCodeAt(i).toString(32);
    }

    return out.join('').slice(0, txt.length);
  }, getSource = function (hash, code) {
    for (var source in code) {
      if (code[source] === hash) {
        return source;
      }
    }
  }, commonReplacer = function ($0, $1, $2, $3) {
    return '%c' + $2 + $3 + '%c';
  }, match = function (txt, what, stack) {
    var info = transform[what],
        i,
        match;

    while (match = info.re.exec(txt)) {
      i = match.index;
      stack[i] = {
        k: 'start',
        v: typeof info.start === 'string' ? info.start : info.start(match)
      };
      i = i + match[0].length - 1;
      stack[i] = {
        k: 'end',
        v: typeof info.end === 'string' ? info.end : info.end(match)
      };
    }
  }, replace = function (txt, what) {
    var info = transform[what];
    return txt.replace(info.re, info.place);
  }, transform = {
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
        return (match[1] ? 'background-' : '') + 'color:' + (/^[a-fA-F0-9]{3,8}$/.test(match[2]) ? '#' : '') + match[2] + ';';
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
  }, // 'error', 'info', 'log', 'warn' are overwritten
  // it is possible to use original method at any time
  // simply accessing console.methodName.raw( ... ) instead
  overwrite = function (method) {
    var original = console[method];
    if (original) (consolemd[method] = isNodeJS ? function () {
      return original.apply(console, parse.apply(null, arguments));
    } : function () {
      var singleStringArg = arguments.length === 1 && typeof arguments[0] === 'string';
      var args = singleStringArg ? parse(arguments[0]) : arguments; // Todo: We might expose more to the reporter (e.g., returning
      //   `what` and `match` from the `parse`->`match` function) so
      //   the user could, e.g., build spans with classes rather than
      //   inline styles

      if (_reporter) {
        var lastIndex,
            resultInfo,
            msg = args[0],
            formattingArgs = args.slice(1),
            formatRegex = /%c(.*?)(?=%c|$)/g,
            tmpIndex = 0;

        _reporter.init();

        while ((resultInfo = formatRegex.exec(msg)) !== null) {
          var lastIndex = formatRegex.lastIndex;
          var result = resultInfo[0];

          if (result.length > 2) {
            // Ignore any empty %c's
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
  }, consolemd = {}, methods = ['error', 'info', 'log', 'warn'], key, i = 0; i < methods.length; i++) {
    overwrite(methods[i]);
  } // if this is a CommonJS module


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
  } catch (e) {
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
    constructor(context, opts) {
      opts = opts || {};
      this.context = context || document.body;
      this.allowHTML = opts.allowHTML;
    }

    init() {
      this.container = document.createElement('li');
    }

    report(text, styles) {
      if (styles) {
        var span = document.createElement('span');
        span.setAttribute('style', styles);
        span[this.allowHTML ? 'innerHTML' : 'textContent'] = text;
        this.container.append(span);
      } else {
        this.container.append(text);
      }
    }

    done(args) {
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
      console.assert.apply(console, arguments); // in order to read or know failures on browsers

      if (!condition) tressa.exitCode = 1;

      if (typeof message === 'string' && condition) {
        tressa.console.log('#green(✔) ' + message);
      }
    } catch (error) {
      tressa.exitCode = 1;
      tressa.console.error('#red(✖) ' + error);
    }
  } // on top of the test to show a nice title
  // test.title('My Library');


  tressa.title = function (title) {
    tressa.testName = title;
    tressa.console.info('# ' + title);
    console.time(title);
  }; // for asynchronous tests

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
    var resolve = Object,
        reject = Object,
        timer = setTimeout(function () {
      var reason = '*timeout (' + (timeout || tressa.timeout) + 'ms)* ' + (fn.name || fn);
      reject(reason);
      tressa(false, reason);
    }, timeout || tressa.timeout);
    setTimeout(function () {
      fn(function () {
        resolve.apply(null, arguments);
        clearTimeout(timer);
      });
    });
    return typeof Promise !== 'undefined' ? new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    }) : null;
  }; // default expiring timeout


  tressa.timeout = 10000; // for synchronous tests (alias)

  tressa.assert = tressa.sync = tressa; // to log Markdown like strings

  tressa.console = consolemd;
  tressa.log = tressa.console.log; // to end on browsers

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
  } catch (o_O) {}

  const addHTMLReporter = function (context, opts) {
    addReporter(new HTMLReporter(context, opts));
  };

  function htmlReporter (context = document.body, {
    allowHTML = true
  } = {}) {
    const {
      assert,
      time,
      timeEnd
    } = console; // Keep track of timers ourselves (only approximate to that in console)

    const htmlMsg = ({
      element,
      text,
      backgroundColor,
      textColor
    }) => {
      const elem = document.createElement(element || 'span');
      elem[allowHTML ? 'innerHTML' : 'textContent'] = text;
      if (backgroundColor) elem.style.backgroundColor = backgroundColor;
      if (textColor) elem.style.color = textColor;
      return elem;
    };

    const htmlWarn = msg => {
      const warning = htmlMsg({
        text: msg,
        backgroundColor: 'lightyellow',
        textColor: 'black'
      });
      context.append(warning, document.createElement('br'));
    };

    const htmlLog = msg => {
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

  var mocha = {
    setup: function setup(_ref) {
      var ui = _ref.ui,
          $context = _ref.$context,
          $allowHTML = _ref.$allowHTML;

      if (ui === 'tdd') {
        addHTMLReporter($context, {
          allowHTML: $allowHTML
        });
        htmlReporter($context, {
          allowHTML: $allowHTML
        });
      } // else if (ui === 'bdd') { } // Todo

    }
  };

  function iterateGroups(_x) {
    return _iterateGroups.apply(this, arguments);
  }

  function _iterateGroups() {
    _iterateGroups = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6(innerGroups) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return innerGroups.reduce(
              /*#__PURE__*/
              function () {
                var _ref4 = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee5(p, _ref3) {
                  var groupTitle, beforeEachs, afterEachs, its, innerGroups, parentCtx, labelAndFn;
                  return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          labelAndFn = function _ref10(context, beforeFunction, afterFunction) {
                            return (
                              /*#__PURE__*/
                              function () {
                                var _ref6 = _asyncToGenerator(
                                /*#__PURE__*/
                                regeneratorRuntime.mark(function _callee2(p, _ref5) {
                                  var title, fn, finished, res, rej, done, ret;
                                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                      switch (_context2.prev = _context2.next) {
                                        case 0:
                                          done = function _ref7(rejected) {
                                            finished = true;

                                            if (rej && rejected !== undefined) {
                                              rej(); // rejected

                                              return;
                                            }

                                            if (res) {
                                              res(title);
                                            }
                                          };

                                          title = _ref5.title, fn = _ref5.fn;
                                          _context2.next = 4;
                                          return p;

                                        case 4:
                                          finished = false;

                                          if (!beforeFunction) {
                                            _context2.next = 8;
                                            break;
                                          }

                                          _context2.next = 8;
                                          return beforeFunction(title);

                                        case 8:
                                          ret = fn.call(context, done);

                                          if (!(ret && ret.then)) {
                                            _context2.next = 14;
                                            break;
                                          }

                                          _context2.next = 12;
                                          return ret;

                                        case 12:
                                          _context2.next = 17;
                                          break;

                                        case 14:
                                          if (!(fn.length && !finished)) {
                                            _context2.next = 17;
                                            break;
                                          }

                                          _context2.next = 17;
                                          return new Promise(function (resolve, reject) {
                                            res = resolve;
                                            rej = reject;
                                          });

                                        case 17:
                                          if (!afterFunction) {
                                            _context2.next = 20;
                                            break;
                                          }

                                          _context2.next = 20;
                                          return afterFunction(title);

                                        case 20:
                                        case "end":
                                          return _context2.stop();
                                      }
                                    }
                                  }, _callee2, this);
                                }));

                                return function (_x4, _x5) {
                                  return _ref6.apply(this, arguments);
                                };
                              }()
                            );
                          };

                          groupTitle = _ref3.title, beforeEachs = _ref3.beforeEachs, afterEachs = _ref3.afterEachs, its = _ref3.its, innerGroups = _ref3.innerGroups;
                          _context5.next = 4;
                          return p;

                        case 4:
                          parentCtx = {};
                          tressa.log("## ".concat(groupTitle));

                          if (its.length) {
                            _context5.next = 11;
                            break;
                          }

                          _context5.next = 9;
                          return beforeEachs.reduce(labelAndFn(parentCtx, function (beforeEachTitle) {
                            tressa.log("_beforeEach_: ".concat(beforeEachTitle));
                          }), Promise.resolve());

                        case 9:
                          _context5.next = 13;
                          break;

                        case 11:
                          _context5.next = 13;
                          return its.reduce(labelAndFn({
                            // Test context
                            test: {
                              parent: {
                                ctx: parentCtx
                              }
                            }
                          },
                          /*#__PURE__*/
                          function () {
                            var _ref8 = _asyncToGenerator(
                            /*#__PURE__*/
                            regeneratorRuntime.mark(function _callee3(testTitle) {
                              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                while (1) {
                                  switch (_context3.prev = _context3.next) {
                                    case 0:
                                      _context3.next = 2;
                                      return beforeEachs.reduce(labelAndFn(parentCtx, function (beforeEachTitle) {
                                        tressa.log("_beforeEach_: ".concat(beforeEachTitle));
                                      }), Promise.resolve());

                                    case 2:
                                      tressa.log("**TEST**: ".concat(testTitle));

                                    case 3:
                                    case "end":
                                      return _context3.stop();
                                  }
                                }
                              }, _callee3, this);
                            }));

                            return function (_x6) {
                              return _ref8.apply(this, arguments);
                            };
                          }(),
                          /*#__PURE__*/
                          _asyncToGenerator(
                          /*#__PURE__*/
                          regeneratorRuntime.mark(function _callee4() {
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                              while (1) {
                                switch (_context4.prev = _context4.next) {
                                  case 0:
                                    _context4.next = 2;
                                    return afterEachs.reduce(labelAndFn(parentCtx, function (afterEachTitle) {
                                      tressa.log("_afterEach_: ".concat(afterEachTitle));
                                    }), Promise.resolve());

                                  case 2:
                                  case "end":
                                    return _context4.stop();
                                }
                              }
                            }, _callee4, this);
                          }))), Promise.resolve());

                        case 13:
                          if (its.length) {
                            _context5.next = 16;
                            break;
                          }

                          _context5.next = 16;
                          return afterEachs.reduce(labelAndFn(parentCtx, function (afterEachTitle) {
                            tressa.log("_afterEach_: ".concat(afterEachTitle));
                          }), Promise.resolve());

                        case 16:
                          _context5.next = 18;
                          return iterateGroups(innerGroups);

                        case 18:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  }, _callee5, this);
                }));

                return function (_x2, _x3) {
                  return _ref4.apply(this, arguments);
                };
              }(), Promise.resolve());

            case 2:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));
    return _iterateGroups.apply(this, arguments);
  }

  var testGroups = {
    innerGroups: []
  };
  var referenceTestGroup = testGroups;

  function describe(title, groupFn) {
    var firstRun = !testGroups.innerGroups.length;
    referenceTestGroup.innerGroups.push({
      title: title,
      beforeEachs: [],
      afterEachs: [],
      its: [],
      innerGroups: []
    });
    var lastReferenceTestGroup = referenceTestGroup;
    referenceTestGroup = referenceTestGroup.innerGroups[referenceTestGroup.innerGroups.length - 1];
    groupFn();
    referenceTestGroup = lastReferenceTestGroup;

    if (firstRun) {
      setTimeout(
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // console.log('testGroups', testGroups);
                tressa.title(typeof document !== 'undefined' ? document.title : 'Node tests');
                _context.next = 3;
                return iterateGroups(testGroups.innerGroups);

              case 3:
                tressa.end();

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      })));
    }
  }

  function it(title, fn) {
    referenceTestGroup.its.push({
      title: fn && title || '',
      fn: fn || title
    });
  }


  var assert = tressa.sync.bind(tressa);

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol") {
      _typeof$1 = function _typeof$$1(obj) {
        return _typeof(obj);
      };
    } else {
      _typeof$1 = function _typeof$$1(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof(obj);
      };
    }

    return _typeof$1(obj);
  }
  /* eslint-env browser */


  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }

    return Promise.reject(new Error(response.statusText));
  }

  function retrieval(response) {
    return response.json();
  }

  function postJSON(url, bodyObject, cb, errBack) {
    var dataObject = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    var credentials = 'same-origin',
        statusCb = status,
        retrievalCb = retrieval;

    if (url && _typeof$1(url) === 'object') {
      bodyObject = url.body || bodyObject;
      cb = url.callback || cb;
      errBack = url.errBack || errBack; // Properties only available via this object argument API

      statusCb = url.status || status;
      retrievalCb = url.retrieval || retrieval;
      credentials = url.credentials || credentials; // "omit" (default), "same-origin", "include"

      dataObject.headers = Object.assign(dataObject.headers, url.headers);
      url = url.url;
    }

    if (bodyObject) {
      dataObject.body = JSON.stringify(bodyObject);
    }

    dataObject.credentials = credentials;
    var ret = (typeof fetch !== 'undefined' ? fetch : postJSON.fetch)(url, dataObject).then(statusCb).then(retrievalCb);

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

  if (typeof document !== 'undefined') {
    mocha.setup({
      ui: 'tdd',
      $context: document.querySelector('#results')
    }); // $allowHTML: true
  }

  describe('postJSON', function () {
    it('Can post JSON and receive a that JSON back within a larger JSON object',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var json;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return postJSON({
                url: 'http://localhost:8090/',
                body: {
                  test: 1
                },
                credentials: 'omit'
              });

            case 2:
              json = _context.sent;
              assert(json && _typeof(json) === 'object', 'Returns an object');
              assert(json && json.reply && json.reply.test === 1, 'Receives response back');

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
  });

})));
