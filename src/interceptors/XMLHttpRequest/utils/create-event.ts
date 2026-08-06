import { EventPolyfill } from '../polyfills/event-polyfill'
import { ProgressEventPolyfill } from '../polyfills/progress-event-polyfill'

const SUPPORTS_PROGRESS_EVENT = typeof ProgressEvent !== 'undefined'

export function createEvent(
  target: XMLHttpRequest | XMLHttpRequestUpload,
  type: string,
  init?: ProgressEventInit
): EventPolyfill | ProgressEvent {
  const progressEvents = [
    'error',
    'progress',
    'loadstart',
    'loadend',
    'load',
    'timeout',
    'abort',
  ]

  /**
   * `ProgressEvent` is not supported in React Native.
   * @see https://github.com/mswjs/interceptors/issues/40
   */
  const ProgressEventClass = SUPPORTS_PROGRESS_EVENT
    ? ProgressEvent
    : ProgressEventPolyfill

  const total = init?.total || 0

  const event = progressEvents.includes(type)
    ? new ProgressEventClass(type, {
        /**
         * @note Per spec, a progress event is length-computable only when
         * the total length is known, i.e. when `length` is not 0.
         * @see https://xhr.spec.whatwg.org/#concept-event-fire-progress
         */
        lengthComputable: init?.lengthComputable ?? total !== 0,
        loaded: init?.loaded || 0,
        total,
      })
    : new EventPolyfill(type, {
        target,
        currentTarget: target,
      })

  return event
}
