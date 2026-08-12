import type { H3Event } from 'h3'

// Minimal stand-in for an H3Event: h3's getQuery() only reads event.path, and
// getRouterParam()/getRouterParams() only read event.context.params.
export function mockEvent(opts: { params?: Record<string, string>; query?: Record<string, string> } = {}): H3Event {
  const search = opts.query ? `?${new URLSearchParams(opts.query).toString()}` : ''
  return {
    path: `/${search}`,
    context: { params: opts.params ?? {} }
  } as H3Event
}
