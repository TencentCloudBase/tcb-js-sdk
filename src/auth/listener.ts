const ListenerMap: any = {};


export function addEventListener(event: string, listener: Function) {
  if (ListenerMap[event]) {
    ListenerMap[event].push(listener)
  } else {
    ListenerMap[event] = [listener]
  }
}

export function activateEvent(event: string, data?: any) {
  if (ListenerMap[event]) {
    for (let listener of ListenerMap[event]) {
      listener(data)
    }
  }
}
