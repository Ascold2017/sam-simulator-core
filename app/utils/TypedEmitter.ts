type EventMap = {
  [event: string]: any; // Все события принимают один параметр с данными
};

class TypedEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};

  // Подписка на событие
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(listener);
  }

  // Отписка от события
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.listeners[event] = this.listeners[event]?.filter(
      (l) => l !== listener
    );
  }

  // Вызов события
  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach((listener) => listener(data));
  }
}

export default TypedEmitter;
