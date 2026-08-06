/**
 * Return a total byte length of the given request/response body.
 * If the `Content-Length` header is present, it will be used as the byte length.
 *
 * Returns `null` if the byte length cannot be computed. That happens when the
 * `Content-Length` header holds a non-numeric value, or when reading the body
 * throws (e.g. `structuredClone()` failing to clone a `Response` on Node.js v18.19).
 * The caller must then report the progress event as not length-computable.
 */
export async function getBodyByteLength(
  input: Request | Response
): Promise<number | null> {
  const explicitContentLength = input.headers.get('content-length')

  if (explicitContentLength != null && explicitContentLength !== '') {
    const contentLength = Number(explicitContentLength)
    return Number.isFinite(contentLength) ? contentLength : null
  }

  try {
    const buffer = await input.arrayBuffer()
    return buffer.byteLength
  } catch {
    return null
  }
}
