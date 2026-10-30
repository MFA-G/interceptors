// @vitest-environment node
import http from 'node:http'
import { HttpRequestInterceptor } from '#/src/interceptors/http'
import { createRawTestServer, toWebResponse } from '#/test/helpers'

const interceptor = new HttpRequestInterceptor()

beforeAll(() => {
  interceptor.apply()
})

afterEach(() => {
  interceptor.removeAllListeners()
})

afterAll(() => {
  interceptor.dispose()
})

it('does not corrupt a header value with a colon and a space when rewriting the request headers', async () => {
  await using server = await createRawTestServer(() => {
    return http.createServer((request, response) => {
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify(request.headers))
    })
  })

  /**
   * @note Modifying any request header makes the interceptor rewrite
   * the outgoing headers block before passing the request through.
   */
  interceptor.on('request', ({ request }) => {
    request.headers.set('x-appended-header', 'modified')
  })

  const request = http.get(server.http.url('/'), {
    headers: {
      'x-test': 'a: b',
    },
  })
  const [response] = await toWebResponse(request)

  expect(response.status).toBe(200)
  await expect(response.json()).resolves.toMatchObject({
    'x-appended-header': 'modified',
    'x-test': 'a: b',
  })
})
