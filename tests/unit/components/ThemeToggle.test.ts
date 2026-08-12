// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ThemeToggle from '~/app/components/ThemeToggle.vue'

function stubColorMode(value: 'dark' | 'light') {
  const colorMode = { preference: value, value }
  vi.stubGlobal('useColorMode', () => colorMode)
  return colorMode
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ThemeToggle', () => {
  it('switches preference from dark to light on click', async () => {
    const colorMode = stubColorMode('dark')
    const wrapper = mount(ThemeToggle)

    await wrapper.find('button').trigger('click')

    expect(colorMode.preference).toBe('light')
  })

  it('switches preference from light to dark on click', async () => {
    const colorMode = stubColorMode('light')
    const wrapper = mount(ThemeToggle)

    await wrapper.find('button').trigger('click')

    expect(colorMode.preference).toBe('dark')
  })
})
