package com.frozenframe;

import android.os.Handler;
import android.os.SystemClock;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class TimerThread extends Thread {
  private boolean isRunning = true;
  private boolean gettingCopy = false;
  private HashMap<String, Long> timeSeriesMap;
  private List<String> timeStampsList;
  long previousTimestamp = 0;

  public TimerThread() {
    this.timeSeriesMap = new HashMap<String, Long>();
    this.timeStampsList = new ArrayList<String>();
  }

  @Override
  public void run() {
    while (isRunning) {
      if(!gettingCopy)
        updateMap();
    }
  }

  private void updateMap() {
    Long key = System.currentTimeMillis();
    Long value = SystemClock.uptimeMillis();
    if(timeSeriesMap.size()>=3000){
      timeSeriesMap.remove(timeStampsList.get(0));
      timeStampsList.remove(0);
    }
    if(previousTimestamp!=key){
      timeSeriesMap.put(key+"", value);
      timeStampsList.add(key+"");
      previousTimestamp=key;
    }

  }

  public void stopUpdating() {
    isRunning = false;
  }
  public HashMap<String,Long> getTimeStampMap() {
    gettingCopy=true;
    HashMap<String,Long> ans = new HashMap<String,Long>();
    ans.putAll(timeSeriesMap);
    gettingCopy=false;
    return ans;
  }
}
