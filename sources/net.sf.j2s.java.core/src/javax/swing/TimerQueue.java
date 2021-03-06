/*
 * Some portions of this file have been modified by Robert Hanson hansonr.at.stolaf.edu 2012-2017
 * for use in SwingJS via transpilation into JavaScript using Java2Script.
 *
 * Copyright 1997-2007 Sun Microsystems, Inc.  All Rights Reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Sun designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Sun in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Sun Microsystems, Inc., 4150 Network Circle, Santa Clara,
 * CA 95054 USA or visit www.sun.com if you need additional information or
 * have any questions.
 */



package javax.swing;



import java.util.concurrent.DelayQueue;
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

import java.util.concurrent.atomic.AtomicLong;

import sun.awt.AppContext;



/**
 * Internal class to manage all Timers using one thread.
 * TimerQueue manages a queue of Timers. The Timers are chained
 * together in a linked list sorted by the order in which they will expire.
 *
 * @author Dave Moore
 * @author Igor Kushnirskiy
 */
class TimerQueue implements Runnable
{
    private static final Object sharedInstanceKey =
        new StringBuffer("TimerQueue.sharedInstanceKey");
    @SuppressWarnings("unused")
	private static final Object expiredTimersKey =
        new StringBuffer("TimerQueue.expiredTimersKey");

    private final DelayQueue<DelayedTimer> queue;
    volatile boolean running;

    /* Lock object used in place of class object for synchronization.
     * (4187686)
     */
    private static final Object classLock = new Object();

    /** Base of nanosecond timings, to avoid wrapping */
    private static final long NANO_ORIGIN = System.nanoTime();

    /**
     * Constructor for TimerQueue.
     */
    public TimerQueue() {
        super();
        queue = new DelayQueue<DelayedTimer>();
        // Now start the TimerQueue thread.
        start();
    }


    public static TimerQueue sharedInstance() {
        synchronized (classLock) {
            TimerQueue sharedInst = (TimerQueue)
                                    SwingUtilities.appContextGet(
                                                        sharedInstanceKey);
            if (sharedInst == null) {
                sharedInst = new TimerQueue();
                SwingUtilities.appContextPut(sharedInstanceKey, sharedInst);
            }
            return sharedInst;
        }
    }


    synchronized void start() {
        if (running) {
            throw new RuntimeException("Can't start a TimerQueue " +
                                       "that is already running");
        }
        else {
            final ThreadGroup threadGroup =
                AppContext.getAppContext().getThreadGroup();
//            java.security.AccessController.doPrivileged(
  //              new java.security.PrivilegedAction() {
    //            public Object run() {
                    Thread timerThread = new Thread(threadGroup, TimerQueue.this,
                                                    "TimerQueue");
                    timerThread.setDaemon(true);
                    timerThread.setPriority(Thread.NORM_PRIORITY);
                    timerThread.start();
    //                return null;
    //            }
    //        });
            running = true;
        }
    }

     synchronized void stop() {
         running = false;
     }

    void addTimer(Timer timer, long delayMillis) {
        //timer.getLock().lock();
        try {
            // If the Timer is already in the queue, then ignore the add.
            if (! containsTimer(timer)) {
                addTimer(new DelayedTimer(timer,
                                      TimeUnit.MILLISECONDS.toNanos(delayMillis)
                                      + now()));
            }
        } finally {
            //timer.getLock().unlock();
        }
    }

    private void addTimer(DelayedTimer delayedTimer) {
        assert delayedTimer != null && ! containsTimer(delayedTimer.getTimer());

        Timer timer = delayedTimer.getTimer();
        //timer.getLock().lock();
        try {
            timer.delayedTimer = delayedTimer;
            queue.add(delayedTimer);
        } finally {
            //timer.getLock().unlock();
        }
    }

    void removeTimer(Timer timer) {
        //timer.getLock().lock();
        try {
            if (timer.delayedTimer != null) {
                queue.remove(timer.delayedTimer);
                timer.delayedTimer = null;
            }
        } finally {
            //timer.getLock().unlock();
        }
    }

    boolean containsTimer(Timer timer) {
        //timer.getLock().lock();
        try {
            return timer.delayedTimer != null;
        } finally {
            //timer.getLock().unlock();
        }
    }


    public void run() {
        try {
            while (running) {
                try {
                    Timer timer = queue.take().getTimer();
                    //timer.getLock().lock();
                    try {
                        DelayedTimer delayedTimer = timer.delayedTimer;
                        if (delayedTimer != null) {
                            /*
                             * Timer is not removed after we get it from
                             * the queue and before the lock on the timer is
                             * acquired
                             */
                            timer.post(); // have timer post an event
                            timer.delayedTimer = null;
                            if (timer.isRepeats()) {
                                delayedTimer.setTime(now()
                                    + TimeUnit.MILLISECONDS.toNanos(
                                          timer.getDelay()));
                                addTimer(delayedTimer);
                            }
                        }
                    } catch (SecurityException ignore) {
                    } finally {
                        //timer.getLock().unlock();
                    }
                } catch (InterruptedException ignore) {
                }
            }
        }
        catch (ThreadDeath td) {
            synchronized (this) {
                running = false;
                // Mark all the timers we contain as not being queued.
                for (DelayedTimer delayedTimer : queue) {
                    delayedTimer.getTimer().cancelNotify();
                }
                throw td;
            }
        }
    }


    public String toString() {
        StringBuilder buf = new StringBuilder();
        buf.append("TimerQueue (");
        boolean isFirst = true;
        for (DelayedTimer delayedTimer : queue) {
            if (! isFirst) {
                buf.append(", ");
            }
            buf.append(delayedTimer.getTimer().toString());
            isFirst = false;
        }
        buf.append(")");
        return buf.toString();
    }

    /**
     * Returns nanosecond time offset by origin
     */
    private final static long now() {
        return System.nanoTime() - NANO_ORIGIN;
    }

    static class DelayedTimer implements Delayed {
        // most of it copied from
        // java.util.concurrent.ScheduledThreadPoolExecutor

        /**
         * Sequence number to break scheduling ties, and in turn to
         * guarantee FIFO order among tied entries.
         */
        private static final AtomicLong sequencer = new AtomicLong(0);

        /** Sequence number to break ties FIFO */
        private final long sequenceNumber;


        /** The time the task is enabled to execute in nanoTime units */
        private volatile long time;

        private final Timer timer;

        DelayedTimer(Timer timer, long nanos) {
            this.timer = timer;
            time = nanos;
            sequenceNumber = sequencer.getAndIncrement();
        }


        final public long getDelay(TimeUnit unit) {
            return  unit.convert(time - now(), TimeUnit.NANOSECONDS);
        }

        final void setTime(long nanos) {
            time = nanos;
        }

        final Timer getTimer() {
            return timer;
        }

        public int compareTo(Delayed other) {
            if (other == this) { // compare zero ONLY if same object
                return 0;
            }
            if (other instanceof DelayedTimer) {
                DelayedTimer x = (DelayedTimer)other;
                long diff = time - x.time;
                if (diff < 0) {
                    return -1;
                } else if (diff > 0) {
                    return 1;
                } else if (sequenceNumber < x.sequenceNumber) {
                    return -1;
                }  else {
                    return 1;
                }
            }
            long d = (getDelay(TimeUnit.NANOSECONDS) -
                      other.getDelay(TimeUnit.NANOSECONDS));
            return (d == 0) ? 0 : ((d < 0) ? -1 : 1);
        }
    }
}
