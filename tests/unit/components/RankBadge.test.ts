// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RankBadge from '~/app/components/RankBadge.vue'

describe('RankBadge', () => {
  it('renders the rank number prefixed with #', () => {
    const wrapper = mount(RankBadge, { props: { rank: 4 } })
    expect(wrapper.text()).toBe('#4')
  })

  it.each([
    [1, 'text-accent'],
    [2, 'text-ink-300'],
    [3, 'text-amber-700']
  ])('applies the medal color class for rank %i', (rank, klass) => {
    const wrapper = mount(RankBadge, { props: { rank } })
    expect(wrapper.classes()).toContain(klass)
  })

  it('falls back to the default color class outside the top 3', () => {
    const wrapper = mount(RankBadge, { props: { rank: 42 } })
    expect(wrapper.classes()).toContain('text-ink-500')
  })
})
