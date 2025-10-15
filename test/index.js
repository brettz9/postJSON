// eslint-disable-next-line no-shadow -- To fix
import {assert} from 'chai';

describe('postJSON', function () {
  it(
    'Can post JSON and receive a that JSON back within ' +
      'a larger JSON object', async function () {
      const json = await postJSON(
        'http://127.0.0.1:8090/',
        {
          test: 1
        }
      );
      assert(json && typeof json === 'object', 'Returns an object');
      assert(
        json && json.reply && json.reply.test === 1, 'Receives response back'
      );
    }
  );
  it(
    'Can post JSON and receive a that JSON back within ' +
      'a larger JSON object (object signature)', async function () {
      const json = await postJSON({
        url: 'http://127.0.0.1:8090/',
        body: {
          test: 1
        },
        credentials: 'omit'
      });
      assert(json && typeof json === 'object', 'Returns an object');
      assert(
        json && json.reply && json.reply.test === 1, 'Receives response back'
      );
    }
  );
  it(
    'Can post JSON and receive a that JSON back within ' +
      'a larger JSON object (object signature with separate body)',
    async function () {
      const json = await postJSON({
        url: 'http://127.0.0.1:8090/'
      }, {
        test: 1
      });
      assert(json && typeof json === 'object', 'Returns an object');
      assert(
        json && json.reply && json.reply.test === 1, 'Receives response back'
      );
    }
  );
  it(
    'Can post JSON and receive a that JSON back within ' +
      'a larger JSON object (and with a callback)', async function () {
      let callbackCalled = false;
      const json = await postJSON({
        url: 'http://127.0.0.1:8090/',
        body: {
          test: 1
        },
        callback (jsn) {
          callbackCalled = true;
          assert(jsn && typeof jsn === 'object', 'Returns an object');
          return jsn;
        },
        credentials: 'omit'
      });
      assert(callbackCalled);
      assert(json && typeof json === 'object', 'Returns an object');
      assert(
        json && json.reply && json.reply.test === 1, 'Receives response back'
      );
    }
  );
  it('rejects with missing body', async function () {
    let err;
    try {
      await postJSON({
        url: 'http://127.0.0.1:8090/bad-path',
        credentials: 'omit'
      });
    } catch (error) {
      err = error;
    }
    // eslint-disable-next-line no-restricted-syntax -- Just testing
    assert(err instanceof Error);
  });
  it('rejects with bad server path', async function () {
    let err;
    try {
      await postJSON({
        url: 'http://127.0.0.1:8090/bad-path',
        body: {
          test: 1
        },
        credentials: 'omit'
      });
    } catch (error) {
      err = error;
    }
    // eslint-disable-next-line no-restricted-syntax -- Just testing
    assert(err instanceof Error);
  });

  it('rejects with bad server path (and errBack)', async function () {
    let err;
    let errbackCalled = false;
    try {
      await postJSON({
        url: 'http://127.0.0.1:8090/bad-path',
        body: {
          test: 1
        },
        errBack (error) {
          errbackCalled = true;
          throw error;
        },
        credentials: 'omit'
      });
    } catch (error) {
      err = error;
    }
    assert(errbackCalled);
    // eslint-disable-next-line no-restricted-syntax -- Just testing
    assert(err instanceof Error);
  });

  it('rejects with internal error status code', async function () {
    this.timeout(10000);
    let err;
    try {
      await postJSON({
        url: 'http://127.0.0.1:8090/internal-error',
        body: {
          test: 1
        },
        credentials: 'omit'
      });
    } catch (error) {
      err = error;
    }
    // eslint-disable-next-line no-restricted-syntax -- Just testing
    assert(err instanceof Error);
  });
});
