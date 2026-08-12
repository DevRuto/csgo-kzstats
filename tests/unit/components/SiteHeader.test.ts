// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SiteHeader from '~/app/components/SiteHeader.vue'

// SiteHeader calls Nuxt's useRoute()/useRuntimeConfig() composables directly (no import,
// resolved via Nuxt's auto-import at build time), so tests stub them as globals before
// each mount. NuxtLink is stubbed as a plain <a> so href/active-state can be asserted.
const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

function mountHeader(path: string, pub: { gokzEnabled: boolean; kztimerEnabled: boolean }) {
  vi.stubGlobal('useRoute', () => ({ path }))
  vi.stubGlobal('useRuntimeConfig', () => ({ public: pub }))
  return mount(SiteHeader, { global: { stubs: { NuxtLink: NuxtLinkStub } } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SiteHeader', () => {
  it('shows both section links when both are enabled', () => {
    const wrapper = mountHeader('/', { gokzEnabled: true, kztimerEnabled: true })
    const links = wrapper.findAll('a').map(a => a.attributes('href'))

    expect(links).toContain('/gokz')
    expect(links).toContain('/kztimer')
  })

  it('hides a section link when that section is disabled', () => {
    const wrapper = mountHeader('/', { gokzEnabled: true, kztimerEnabled: false })
    const links = wrapper.findAll('a').map(a => a.attributes('href'))

    expect(links).toContain('/gokz')
    expect(links).not.toContain('/kztimer')
  })

  it('shows the GOKZ sub-nav only when on a /gokz route', () => {
    const wrapper = mountHeader('/gokz/maps', { gokzEnabled: true, kztimerEnabled: true })
    const links = wrapper.findAll('a').map(a => a.attributes('href'))

    expect(links).toContain('/gokz/maps')
    expect(links).toContain('/gokz/jumpstats')
    expect(links).not.toContain('/kztimer/ranks')
  })

  it('shows the KZTimer sub-nav (including Ranks) only when on a /kztimer route', () => {
    const wrapper = mountHeader('/kztimer/ranks', { gokzEnabled: true, kztimerEnabled: true })
    const links = wrapper.findAll('a').map(a => a.attributes('href'))

    expect(links).toContain('/kztimer/maps')
    expect(links).toContain('/kztimer/ranks')
    expect(links).toContain('/kztimer/jumpstats')
    expect(links).not.toContain('/gokz/maps')
  })

  it('shows no sub-nav on the home page', () => {
    const wrapper = mountHeader('/', { gokzEnabled: true, kztimerEnabled: true })
    const links = wrapper.findAll('a').map(a => a.attributes('href'))

    expect(links).toEqual(['/', '/gokz', '/kztimer'])
  })
})
