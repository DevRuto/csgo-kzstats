// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TabGroup from '~/app/components/TabGroup.vue'

const options = [
  { label: 'Pro', value: 'pro' },
  { label: 'TP', value: 'tp' }
]

describe('TabGroup', () => {
  it('renders one button per option', () => {
    const wrapper = mount(TabGroup, { props: { options, modelValue: 'pro' } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]!.text()).toBe('Pro')
    expect(buttons[1]!.text()).toBe('TP')
  })

  it('highlights the button matching modelValue', () => {
    const wrapper = mount(TabGroup, { props: { options, modelValue: 'tp' } })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.classes()).not.toContain('bg-amber-400')
    expect(buttons[1]!.classes()).toContain('bg-amber-400')
  })

  it('emits update:modelValue with the clicked option value', async () => {
    const wrapper = mount(TabGroup, { props: { options, modelValue: 'pro' } })
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['tp']])
  })
})
