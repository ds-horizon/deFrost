package com.frozenframe;

import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

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

  public void sendLogs(String timestamp, String message) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        try {
          URL url = new URL("https://localhost:3001/user-logs"); // Replace with your API URL
          HttpURLConnection conn = (HttpURLConnection) url.openConnection();
          conn.setRequestMethod("POST");
          conn.setRequestProperty("Content-Type", "application/json");
          conn.setDoOutput(true);

          String jsonInputString = message + "," + timestamp + "\n";
          try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
          }

          conn.getInputStream().close();
        } catch (Exception e) {
          Log.d("Defrost:", e.toString());
        }
      }
    });
  }

  public void sendLogs(Long timestamp, ReadableMap tree) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        try {
          String message = ReadableMapUtils.readableMapToJSONString(tree);
          URL url = new URL("https://localhost:3001/react-commits");
          HttpURLConnection conn = (HttpURLConnection) url.openConnection();
          conn.setRequestMethod("POST");
          conn.setRequestProperty("Content-Type", "application/json");
          conn.setDoOutput(true);
          String jsonInputString = timestamp + " $$$" +message + "\n"+ "---------------------\n";
          try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
          }

          conn.getInputStream().close();
        } catch (Exception e) {
          Log.d("Defrost:", e.toString());
        }
      }
    });
  }
}
