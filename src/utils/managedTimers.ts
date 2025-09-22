interface TimerEntry {
  id: number;
  type: 'timeout' | 'interval';
  callback: Function;
  delay: number;
  created: number;
  component?: string;
}

class ManagedTimerService {
  private timers = new Map<number, TimerEntry>();
  private nextId = 1;
  
  setTimeout(callback: Function, delay: number, component?: string): number {
    const id = this.nextId++;
    const timerId = window.setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    
    this.timers.set(id, {
      id: timerId,
      type: 'timeout',
      callback,
      delay,
      created: Date.now(),
      component
    });
    
    return id;
  }
  
  setInterval(callback: Function, delay: number, component?: string): number {
    const id = this.nextId++;
    const timerId = window.setInterval(callback, delay);
    
    this.timers.set(id, {
      id: timerId,
      type: 'interval',
      callback,
      delay,
      created: Date.now(),
      component
    });
    
    return id;
  }
  
  clearTimeout(id: number): void {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'timeout') {
      window.clearTimeout(timer.id);
      this.timers.delete(id);
    }
  }
  
  clearInterval(id: number): void {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'interval') {
      window.clearInterval(timer.id);
      this.timers.delete(id);
    }
  }
  
  clearAllTimers(): void {
    this.timers.forEach(timer => {
      if (timer.type === 'timeout') {
        window.clearTimeout(timer.id);
      } else {
        window.clearInterval(timer.id);
      }
    });
    this.timers.clear();
  }
  
  clearComponentTimers(component: string): void {
    this.timers.forEach((timer, id) => {
      if (timer.component === component) {
        if (timer.type === 'timeout') {
          window.clearTimeout(timer.id);
        } else {
          window.clearInterval(timer.id);
        }
        this.timers.delete(id);
      }
    });
  }
  
  getActiveTimers(): TimerEntry[] {
    return Array.from(this.timers.values());
  }
  
  getTimerStats(): { total: number; timeouts: number; intervals: number; oldTimers: number } {
    const now = Date.now();
    const timers = Array.from(this.timers.values());
    
    return {
      total: timers.length,
      timeouts: timers.filter(t => t.type === 'timeout').length,
      intervals: timers.filter(t => t.type === 'interval').length,
      oldTimers: timers.filter(t => now - t.created > 300000).length // > 5 minutes
    };
  }
}

export const ManagedTimers = new ManagedTimerService();