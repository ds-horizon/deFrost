const { parentPort } = require('worker_threads');
const http = require('http');
const fs = require('fs');
const path = require('path');

const reactFilePath = path.join(__dirname, './data/reactCommits.txt');
const userLogsFilePath = path.join(__dirname, './data/userLogs.txt');
const options = {
  key: fs.readFileSync(path.join(__dirname, './credentials/server.key')),
  cert: fs.readFileSync(path.join(__dirname, './credentials/server.cert')),
};

const server = http.createServer(options, (req, res) => {
  if (req.method === 'POST' && req.url === '/react-commits') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const logData = body;
      const filePath =
        req.url === '/react-commits' ? reactFilePath : userLogsFilePath;
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFile(filePath, logData, (err) => {
        if (err) {
          console.error('Failed to write to file:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        parentPort.postMessage('Request logged:', logData.trim());
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Request logged successfully');
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint not found');
  }
});

server.listen(3001, () => {
  parentPort.postMessage('Server running on http://localhost:3001');
});
