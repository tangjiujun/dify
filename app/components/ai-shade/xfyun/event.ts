export class MyEvent extends Event {
  meta: any

  constructor(str: string) {
    super(str)
  }
}
export const eventTarget = new EventTarget()

export const recordStartEvent = new MyEvent('recordStart')

export const recordEndEvent = new MyEvent('recordEnd')

export const recordChangeEvent = new MyEvent('recordChange')
