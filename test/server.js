import http from 'http';

http.createServer(function (req, res) {
  if (req.url === '/internal-error') {
    res.writeHead(500).end('');
    return;
  }
  if (req.url === '/') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      try {
        body = JSON.parse(body);
      } catch (err) {
        res.end(JSON.stringify({error: err.toString()}));
        return;
      }
      res.end(JSON.stringify({reply: body}));
    });
    return;
  }
  res.end('Unrecognized path');
}).listen(8090, '127.0.0.1');

// eslint-disable-next-line no-console -- CLI
console.log('Listening at 127.0.0.1:8090');
