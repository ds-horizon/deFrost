const { parentPort } = require('worker_threads');
const http = require('http');
const fs = require('fs');
const path = require('path');

const reactFilePath = path.join(__dirname, './data/reactCommits.txt');
const userLogsFilePath = path.join(__dirname, './data/userLogs.txt');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/react-commits') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const logData = body;
      const filePath =
        req.url === '/react-commits' ? reactFilePath : userLogsFilePath;
      fs.appendFile(filePath, logData, (err) => {
        if (err) {
          console.error('Failed to write to file:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        console.log('Request logged:', logData.trim());
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
  console.log('Server running on http://localhost:3001');
  parentPort.postMessage('Server started on http://localhost:3001');
});
