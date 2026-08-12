// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Suspense, ref } from 'vue'
import PlayerSearch from '~/app/components/PlayerSearch.vue'

// PlayerSearch has an async <script setup> (top-level `await useFetch(...)`), so it must be
// mounted inside <Suspense>. useFetch is Nuxt's data-fetching composable (auto-imported, not
// explicitly imported) and reactively refetches when refs used in its `query` option change;
// replicating that reactivity isn't practical outside a real Nuxt runtime, so it's stubbed
// here to return a fixed, per-test-controlled { data, status } pair. The `open` dropdown
// state itself is driven by a plain `search` ref watcher, so it's still exercised directly.
const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

function stubUseFetch(data: unknown[], status: 'pending' | 'success' | 'error' = 'success') {
  vi.stubGlobal('useFetch', () => ({ data: ref(data), status: ref(status) }))
}

async function mountSearch(system: 'gokz' | 'kztimer') {
  const wrapper = mount(
    { components: { PlayerSearch }, template: '<Suspense><PlayerSearch :system="system" /></Suspense>' },
    { data: () => ({ system }), global: { stubs: { NuxtLink: NuxtLinkStub }, components: { Suspense } } }
  )
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('PlayerSearch', () => {
  it('does not show the dropdown when the search box is empty', async () => {
    stubUseFetch([{ steamId32: 1, alias: 'Player1', country: 'US' }])
    const wrapper = await mountSearch('gokz')

    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('opens the dropdown once a search term is typed and shows a loading state while pending', async () => {
    stubUseFetch([], 'pending')
    const wrapper = await mountSearch('gokz')

    await wrapper.find('input').setValue('play')

    expect(wrapper.text()).toContain('Loading')
  })

  it('renders gokz results linked by steamId32, with alias as the label', async () => {
    stubUseFetch([{ steamId32: 111, alias: 'Player1', country: 'US' }])
    const wrapper = await mountSearch('gokz')

    await wrapper.find('input').setValue('play')

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/players/111')
    expect(link.text()).toContain('Player1')
    expect(link.text()).toContain('US')
  })

  it('falls back to "Unknown" for a gokz result with no alias', async () => {
    stubUseFetch([{ steamId32: 111, alias: null, country: null }])
    const wrapper = await mountSearch('gokz')

    await wrapper.find('input').setValue('play')

    expect(wrapper.find('a').text()).toContain('Unknown')
  })

  it('renders kztimer results linked via the derived steamId32, with name as the label', async () => {
    stubUseFetch([{ steamId: 'STEAM_1:0:2', name: 'Player1', country: 'DE' }])
    const wrapper = await mountSearch('kztimer')

    await wrapper.find('input').setValue('play')

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/players/4')
    expect(link.text()).toContain('Player1')
  })

  it('links to an empty href when a kztimer steamId cannot be converted', async () => {
    stubUseFetch([{ steamId: 'not-a-steamid', name: 'Player1', country: null }])
    const wrapper = await mountSearch('kztimer')

    await wrapper.find('input').setValue('play')

    expect(wrapper.find('a').attributes('href')).toBe('')
  })

  it('closes the dropdown 150ms after the input blurs', async () => {
    stubUseFetch([{ steamId32: 111, alias: 'Player1', country: 'US' }])
    const wrapper = await mountSearch('gokz')

    await wrapper.find('input').setValue('play')
    expect(wrapper.find('a').exists()).toBe(true)

    await wrapper.find('input').trigger('blur')
    vi.advanceTimersByTime(150)
    await flushPromises()

    expect(wrapper.find('a').exists()).toBe(false)
  })
})
