package com.frozenframe

public class TimerSingleton {
  private static TimerThread th;
  public TimerSingleton(){
  }
  public static TimerThread getInstance() {
    if(th ==null){
      th= new TimerThread();
    }
    return th;
  }
}
