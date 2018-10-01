import test, {addHTMLReporter} from '../node_modules/tressa/esm/index.js';
import htmlReporter from '../node_modules/tressa/reporters/HTMLReporter.js';

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

      test.log(`## ${groupTitle}`);

      if (!its.length) {
        await beforeEachs.reduce(labelAndFn(parentCtx, (beforeEachTitle) => {
          test.log(`_beforeEach_: ${beforeEachTitle}`);
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
            test.log(`_beforeEach_: ${beforeEachTitle}`);
          }), Promise.resolve());
          test.log(`**TEST**: ${testTitle}`);
        }, async () => {
          await afterEachs.reduce(labelAndFn(parentCtx, (afterEachTitle) => {
            test.log(`_afterEach_: ${afterEachTitle}`);
          }), Promise.resolve());
        }), Promise.resolve());
        // Test code will do its own logging as well
      }
      if (!its.length) {
        await afterEachs.reduce(labelAndFn(parentCtx, (afterEachTitle) => {
          test.log(`_afterEach_: ${afterEachTitle}`);
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
      test.title(typeof document !== 'undefined' ? document.title : 'Node tests');
      await iterateGroups(testGroups.innerGroups);
      test.end();
    });
  }
}

function it (title, fn) {
  referenceTestGroup.its.push({
    title: (fn && title) || '',
    fn: fn || title
  });
}

function beforeEach (title, fn) {
  referenceTestGroup.beforeEachs.push({
    title: (fn && title) || '',
    fn: fn || title
  });
}

function afterEach (title, fn) {
  referenceTestGroup.afterEachs.push({
    title: (fn && title) || '',
    fn: fn || title
  });
}

// We don't want to expose the whole API now in case we use more of Mocha/Chai's assert API
const assert = test.sync.bind(test);

export {describe, it, assert, beforeEach, afterEach, mocha, test};
