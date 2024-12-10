package com.frozenframe;

public class TimerSingleton {
    private static TimerThread timerThread;

    public TimerSingleton() {
    }

    public static TimerThread getInstance() {
        if (timerThread == null) {
            timerThread = new TimerThread();
        }
        return timerThread;
    }
}
