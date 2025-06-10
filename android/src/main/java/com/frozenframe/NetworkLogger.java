package com.frozenframe;

import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.Socket;
import java.util.UUID;
import org.json.JSONObject;
import org.json.JSONException;

public class NetworkLogger {

  private Handler handler;
  private static HandlerThread handlerThread;

  public NetworkLogger() {
    if (handlerThread == null) {
      handlerThread = new HandlerThread("FileLoggerThread");
      handlerThread.start();
    }
    handler = new Handler(handlerThread.getLooper());
  }

  private void sendDataToSocket(String jsonData) {
    Socket socket = null;
    OutputStreamWriter writer = null;
    BufferedReader reader = null;
    
    try {
      // Add messageId if not present
      JSONObject jsonObj = new JSONObject(jsonData);
      if (!jsonObj.has("messageId")) {
        jsonObj.put("messageId", UUID.randomUUID().toString());
      }
      String messageId = jsonObj.getString("messageId");
      //TODO: Currently creating new socket for every message. Think of a better way to handle this.
      // Connect and send
      socket = new Socket("localhost", 3001);
      writer = new OutputStreamWriter(socket.getOutputStream(), "UTF-8");
      reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      
      // Send data
      writer.write(jsonObj.toString() + "\n");
      writer.flush();
      
      // Set socket timeout to avoid hanging
      socket.setSoTimeout(500);
      
      // Wait for acknowledgment
      String response = reader.readLine();
      if (response != null) {
        try {
          JSONObject ackObj = new JSONObject(response);
          if (ackObj.has("ackFor") && messageId.equals(ackObj.getString("ackFor"))) {
            Log.d("Defrost:", "Received acknowledgment for message: " + messageId);
          } else {
            Log.d("Defrost:", "Received invalid acknowledgment: " + response);
          }
        } catch (JSONException e) {
          Log.d("Defrost:", "Error parsing acknowledgment: " + e.toString());
        }
      } else {
        Log.d("Defrost:", "No acknowledgment received for message: " + messageId);
      }
    } catch (Exception e) {
      Log.d("Defrost:", "Socket error: " + e.toString());
    } finally {
      try {
        if (reader != null) reader.close();
        if (writer != null) writer.close();
        if (socket != null) socket.close();
      } catch (IOException e) {
        Log.d("Defrost:", "Error closing socket: " + e.toString());
      }
    }
  }

  public void sendLogs(String timestamp, String message) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        try {
          // Create JSON envelope
          JSONObject jsonEnvelope = new JSONObject();
          jsonEnvelope.put("type", "user_log");
          jsonEnvelope.put("timestamp", timestamp);
          jsonEnvelope.put("message", message); 
          jsonEnvelope.put("messageId", UUID.randomUUID().toString());
          
          // Send as JSON
          sendDataToSocket(jsonEnvelope.toString());
        } catch (JSONException e) {
          Log.d("Defrost:", "JSON error: " + e.toString());
        } catch (Exception e) {
          Log.d("Defrost:", "Error: " + e.toString());
        }
      }
    });
  }

  public void sendLogs(Long timestamp, ReadableMap tree) {
    Log.d("Defrost:", "React: Reached 1");
    handler.post(new Runnable() {
      @Override
      public void run() {
        try {
          Log.d("Defrost:", "React: Reached");
          String treeJson = ReadableMapUtils.readableMapToJSONString(tree);
          
          // Create JSON envelope
          JSONObject jsonEnvelope = new JSONObject();
          jsonEnvelope.put("type", "react_commit");
          jsonEnvelope.put("timestamp", timestamp);
          jsonEnvelope.put("data", new JSONObject(treeJson));
          jsonEnvelope.put("messageId", UUID.randomUUID().toString());
          
          // Send as JSON
          sendDataToSocket(jsonEnvelope.toString());
        } catch (JSONException e) {
          Log.d("Defrost:", "JSON error: " + e.toString());
        } catch (Exception e) {
          Log.d("Defrost:", "Error: " + e.toString());
        }
      }
    });
  }
}
