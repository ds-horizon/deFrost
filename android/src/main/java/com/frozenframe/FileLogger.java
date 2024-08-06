package com.frozenframe


import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;

public class FileLogger {
  private static final String LOG_FOLDER_NAME = "Dream11Log";
  private static final String LOG_FILE_NAME_1 = "changes.txt";
  private static final String LOG_FILE_NAME_2 = "ff.txt";

  private Handler handler;

  public FileLogger() {
    handler = new Handler(Looper.getMainLooper());
  }

  public void log(Long timestamp, ReadableMap message) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        writeToLogFile(timestamp, message);
      }
    });
  }
  public void log(String timestamp,String message){
    handler.post(new Runnable() {
      @Override
      public void run() {
        writeToLogFile(timestamp, message);
      }
    });
  }
  private void writeToLogFile(String timestamp, String message){
    if (!isExternalStorageWritable()) {
      return;
    }
    File logFolder = new File(android.os.Environment.getExternalStorageDirectory(), LOG_FOLDER_NAME);
    if (!logFolder.exists()) {
      if (!logFolder.mkdirs()) {
        return;
      }
    }

    File logFile = new File(logFolder, LOG_FILE_NAME_2);
    try {
      FileWriter writer = new FileWriter(logFile, true);
      writer.write(message+","+timestamp+"\n");
      writer.flush();
      writer.close();
    }
    catch (IOException e) {
      e.printStackTrace();
    }
  }
  private void writeToLogFile(Long timestamp, ReadableMap tree) {
    if (!isExternalStorageWritable()) {
      return;
    }

    File logFolder = new File(android.os.Environment.getExternalStorageDirectory(), LOG_FOLDER_NAME);
    String message = ReadableMapUtils.readableMapToString(tree);
    if (!logFolder.exists()) {
      if (!logFolder.mkdirs()) {
        return;
      }
    }

    File logFile = new File(logFolder, LOG_FILE_NAME_1);
    try {
      FileWriter writer = new FileWriter(logFile, true);
      writer.write(timestamp +" $$$");
      writer.write(message + "\n");
      writer.write("---------------------\n");
      writer.flush();
      writer.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
  private boolean isExternalStorageWritable() {
    String state = android.os.Environment.getExternalStorageState();
    return android.os.Environment.MEDIA_MOUNTED.equals(state);
  }

  public static void writeForFrozenFrame(String timestamp, String event) {
    try{
      HashMap<String,Long> hm= TimerSingleton.getInstance().getTimeStampMap();
      Log.d("TimerThread timestamp",timestamp);
      Long uptimeStamp = hm.get(timestamp)*1000000;
      writeForFrozenFrame(uptimeStamp+"",event);
    } catch (Exception e){
      e.printStackTrace();
    }

  }
}
