// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MapThumb from '~/app/components/MapThumb.vue'

describe('MapThumb', () => {
  it('shows the fallback when no src is given', () => {
    const wrapper = mount(MapThumb, { props: { src: null, alt: 'kz_map1' } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('No image')
  })

  it('renders an img with the given src and alt', () => {
    const wrapper = mount(MapThumb, { props: { src: 'https://example.com/1.webp', alt: 'kz_map1' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/1.webp')
    expect(img.attributes('alt')).toBe('kz_map1')
  })

  it('falls back to the placeholder when the image fails to load', async () => {
    const wrapper = mount(MapThumb, { props: { src: 'https://example.com/broken.webp', alt: 'kz_map1' } })
    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('No image')
  })

  it('resets the failed state when src changes', async () => {
    const wrapper = mount(MapThumb, { props: { src: 'https://example.com/broken.webp', alt: 'kz_map1' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({ src: 'https://example.com/new.webp' })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/new.webp')
  })
})
