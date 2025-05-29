const { parentPort } = require('worker_threads');
const net = require('net');
const fs = require('fs');
const path = require('path');

const reactFilePath = path.join(
  __dirname,
  '../../../../../../data/reactCommits.txt'
);
const userLogsFilePath = path.join(
  __dirname,
  '../../../../../../data/userLogs.txt'
);

const server = net.createServer((socket) => {
  console.log('Client connected');
  let buffer = '';

  socket.on('data', (data) => {
    // Append new data to existing buffer
    buffer += data.toString();

    // Process JSON objects in the buffer
    let startIdx = 0;
    let endIdx = 0;

    // Try to extract and process complete JSON objects
    while ((startIdx = buffer.indexOf('{', startIdx)) !== -1) {
      try {
        // Find a potentially complete JSON object
        let depth = 0;
        let inString = false;
        let escaping = false;

        // Find the matching closing brace by tracking nesting
        for (endIdx = startIdx; endIdx < buffer.length; endIdx++) {
          const char = buffer[endIdx];

          if (escaping) {
            escaping = false;
            continue;
          }

          if (char === '\\') {
            escaping = true;
            continue;
          }

          if (char === '"' && !escaping) {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (char === '{') depth++;
          if (char === '}') depth--;

          // Found the closing brace of a complete JSON object
          if (depth === 0 && endIdx > startIdx) {
            break;
          }
        }

        // If we have a complete JSON object
        if (depth === 0 && endIdx < buffer.length) {
          const jsonStr = buffer.substring(startIdx, endIdx + 1);
          const message = JSON.parse(jsonStr);

          // Extract messageId for acknowledgment
          const messageId = message.messageId || 'unknown';

          // Process the message based on its type
          if (message && message.type) {
            let filePath;
            let contentToWrite;

            if (message.type === 'react_commit') {
              filePath = reactFilePath;
              contentToWrite =
                message.timestamp +
                ' $$$' +
                JSON.stringify(message.data) +
                '\n---------------------\n';
            } else if (message.type === 'user_log') {
              filePath = userLogsFilePath;
              contentToWrite = message.message + ',' + message.timestamp + '\n';
            }

            if (filePath && contentToWrite) {
              // Ensure directory exists
              const dir = path.dirname(filePath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              // Write to file
              fs.appendFile(filePath, contentToWrite, (err) => {
                if (err) {
                  console.error('Failed to write to file:', err);

                  // Send error acknowledgment
                  try {
                    const errorAck = JSON.stringify({
                      status: 'error',
                      ackFor: messageId,
                      error: 'Failed to write to file',
                    });
                    socket.write(errorAck + '\n');
                  } catch (socketErr) {
                    console.error('Error sending acknowledgment:', socketErr);
                  }
                  return;
                }

                const preview =
                  contentToWrite.length > 30
                    ? contentToWrite.substring(0, 30) + '...'
                    : contentToWrite;

                parentPort.postMessage(
                  `Data logged (${message.type}): ${preview}`
                );

                // Send success acknowledgment
                try {
                  const successAck = JSON.stringify({
                    status: 'ok',
                    ackFor: messageId,
                    timestamp: Date.now(),
                  });
                  socket.write(successAck + '\n');
                  console.log(`Sent acknowledgment for message: ${messageId}`);
                } catch (socketErr) {
                  console.error('Error sending acknowledgment:', socketErr);
                }
              });
            } else {
              // Unknown type, still acknowledge
              try {
                const unknownAck = JSON.stringify({
                  status: 'unknown_type',
                  ackFor: messageId,
                });
                socket.write(unknownAck + '\n');
              } catch (socketErr) {
                console.error('Error sending acknowledgment:', socketErr);
              }
            }
          } else {
            // Invalid message format, still acknowledge
            try {
              const invalidAck = JSON.stringify({
                status: 'invalid_format',
                ackFor: messageId,
              });
              socket.write(invalidAck + '\n');
            } catch (socketErr) {
              console.error('Error sending acknowledgment:', socketErr);
            }
          }

          // Move past this JSON object in the buffer
          startIdx = endIdx + 1;
        } else {
          // Incomplete JSON object, wait for more data
          break;
        }
      } catch (error) {
        // Error parsing JSON, move past this position and try again
        console.error('Error parsing JSON:', error);
        startIdx++;
      }
    }

    // Remove processed messages from buffer
    if (startIdx > 0) {
      buffer = buffer.substring(startIdx);
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    // Clear the buffer when connection closes
    buffer = '';
  });
});

server.listen(3001, () => {
  parentPort.postMessage('Socket server running on port 3001');
});
