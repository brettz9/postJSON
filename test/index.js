describe('postJSON', function () {
  it(
    'Can post JSON and receive a that JSON back within ' +
      'a larger JSON object', async function () {
      const json = await postJSON({
        url: 'http://localhost:8090/',
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
});
