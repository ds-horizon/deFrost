package com.frozenframe;


import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReadableMap;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class FileLogger {
    private static final String LOG_FOLDER_NAME = "DefrostLog";
    private static final String LOG_REACT_COMMITS = "reactCommits.txt";
    private static final String LOG_USER_EVENTS = "userLogs.txt";

    private Handler handler;

    public FileLogger() {
        handler = new Handler(Looper.getMainLooper());
    }

    public void writeToLogFile(String timestamp, String message) {
        handler.post(new Runnable() {
            @Override
            public void run() {
                if (!isExternalStorageWritable()) {
                    return;
                }
                File logFolder = new File(android.os.Environment.getExternalStorageDirectory(), LOG_FOLDER_NAME);
                if (!logFolder.exists()) {
                    if (!logFolder.mkdirs()) {
                        return;
                    }
                }

                File logFile = new File(logFolder, LOG_USER_EVENTS);
                try {
                    FileWriter writer = new FileWriter(logFile, true);
                    writer.write(message + "," + timestamp + "\n");
                    writer.flush();
                    writer.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    public void writeToLogFile(Long timestamp, ReadableMap tree) {
        handler.post(new Runnable() {
            @Override
            public void run() {
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

                File logFile = new File(logFolder, LOG_REACT_COMMITS);
                try {
                    FileWriter writer = new FileWriter(logFile, true);
                    writer.write(timestamp + " $$$");
                    writer.write(message + "\n");
                    writer.write("---------------------\n");
                    writer.flush();
                    writer.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    private boolean isExternalStorageWritable() {
        String state = android.os.Environment.getExternalStorageState();
        return !android.os.Environment.MEDIA_MOUNTED.equals(state);
    }
}
