// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatCard from '~/app/components/StatCard.vue'

describe('StatCard', () => {
  it('renders the value and label', () => {
    const wrapper = mount(StatCard, { props: { label: 'Maps', value: 42 } })
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('Maps')
  })

  it('renders string values as-is', () => {
    const wrapper = mount(StatCard, { props: { label: 'Status', value: 'Online' } })
    expect(wrapper.text()).toContain('Online')
  })
})
