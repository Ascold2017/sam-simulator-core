type LogEntry = {
    timestamp: number;
    event: string;
    data: any;
  };
  
  export class Logger {
    private log: LogEntry[] = [];
  
    record(event: string, data: any) {
      this.log.push({
        timestamp: Date.now(),
        event,
        data,
      });
    }
  
    getLog(): LogEntry[] {
      return this.log;
    }
  
    clearLog() {
      this.log = [];
    }
  }
  