// @vitest-environment happy-dom
import { createEvent } from './create-event'
import { EventPolyfill } from '../polyfills/event-polyfill'

const request = new XMLHttpRequest()
request.open('POST', '/user')

it('returns an EventPolyfill instance with the given target set', () => {
  const event = createEvent(request, 'my-event')
  const target = event.target as XMLHttpRequest

  expect(event).toBeInstanceOf(EventPolyfill)
  expect(target).toBeInstanceOf(XMLHttpRequest)
})

it('returns the ProgressEvent instance', () => {
  const event = createEvent(request, 'load', {
    loaded: 100,
    total: 500,
  })

  expect(event).toBeInstanceOf(ProgressEvent)
  expect(event.loaded).toBe(100)
  expect(event.total).toBe(500)
})

it('marks the ProgressEvent as length-computable when the total is known', () => {
  const event = createEvent(request, 'load', {
    loaded: 100,
    total: 500,
  }) as ProgressEvent

  expect(event.lengthComputable).toBe(true)
})

it('marks the ProgressEvent as not length-computable when the total is unknown', () => {
  const event = createEvent(request, 'load', {
    loaded: 0,
    total: 0,
  }) as ProgressEvent

  expect(event.lengthComputable).toBe(false)
  expect(
    (createEvent(request, 'loadstart') as ProgressEvent).lengthComputable
  ).toBe(false)
})

it('respects an explicit "lengthComputable" value', () => {
  expect(
    (
      createEvent(request, 'progress', {
        loaded: 0,
        total: 0,
        lengthComputable: true,
      }) as ProgressEvent
    ).lengthComputable
  ).toBe(true)

  expect(
    (
      createEvent(request, 'progress', {
        loaded: 100,
        total: 500,
        lengthComputable: false,
      }) as ProgressEvent
    ).lengthComputable
  ).toBe(false)
})
