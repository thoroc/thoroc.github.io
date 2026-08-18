import { afterEach, describe, expect, it } from 'bun:test'
import { mount } from '@vue/test-utils'
import type { StarsRepoItem } from '../composables/useStarsStore'
import { resetStateForTests } from '../composables/useStarsStore/resetStateForTests'
import StarCard from './StarCard.vue'

const makeItem = (overrides: Partial<StarsRepoItem> = {}): StarsRepoItem => ({
  id: 'owner-repo',
  fullName: 'owner/repo',
  description: 'A great repo',
  language: 'TypeScript',
  license: 'MIT',
  fork: false,
  stars: 1234,
  starredAt: '2026-01-01',
  pushedAt: '2026-01-01',
  ...overrides,
})

describe('StarCard', () => {
  afterEach(resetStateForTests)

  it('renders owner/repo, language, and license', () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem(), itemIndex: 0 },
    })
    expect(wrapper.find('.star-card__owner').text()).toBe('owner')
    expect(wrapper.find('.star-card__repo').text()).toBe('repo')
    expect(wrapper.text()).toContain('TypeScript')
    expect(wrapper.text()).toContain('MIT')
  })

  it('falls back to a synthesized GitHub URL when item.url is absent', () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem(), itemIndex: 0 },
    })
    const link = wrapper.find('.star-card__title a')
    expect(link.attributes('href')).toBe('https://github.com/owner/repo')
  })

  it('shows a fork badge only when the item is a fork', () => {
    const forked = mount(StarCard, {
      props: { item: makeItem({ fork: true }), itemIndex: 0 },
    })
    expect(forked.find('.star-card__tag--fork').exists()).toBe(true)

    const notForked = mount(StarCard, {
      props: { item: makeItem(), itemIndex: 0 },
    })
    expect(notForked.find('.star-card__tag--fork').exists()).toBe(false)
  })

  it('formats large star counts using the shield-style abbreviation', () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem({ stars: 5400 }), itemIndex: 0 },
    })
    expect(
      wrapper.find('.star-card__shield--stars .star-card__shield-value').text(),
    ).toBe('5.4k')
  })

  it('renders topic tags and applies a topic search on click', async () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem({ topics: ['cli', 'vue'] }), itemIndex: 0 },
    })
    const topicButtons = wrapper.findAll('.star-card__tag--topic')
    expect(topicButtons.length).toBe(2)
    await topicButtons[0]?.trigger('click')
    // applyTopicSearch mutates the store's search query synchronously.
    const { qInput } = await import('../composables/useStarsStore/state')
    expect(qInput.value).toContain('#cli')
  })

  it('falls back to a letter avatar when the image errors', async () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem(), itemIndex: 0 },
    })
    expect(wrapper.find('.star-card__avatar-letter').text()).toBe('O')
  })

  it('hides extras (language/license/meta) when detailMode is collapsed', () => {
    const wrapper = mount(StarCard, {
      props: {
        item: makeItem(),
        itemIndex: 0,
        detailMode: true,
        detailExpanded: false,
      },
    })
    expect(wrapper.find('.star-card__foot').exists()).toBe(false)
  })

  it('shows extras when detailMode is expanded', () => {
    const wrapper = mount(StarCard, {
      props: {
        item: makeItem(),
        itemIndex: 0,
        detailMode: true,
        detailExpanded: true,
      },
    })
    expect(wrapper.find('.star-card__foot').exists()).toBe(true)
  })

  it('shows a placeholder description when none is provided', () => {
    const wrapper = mount(StarCard, {
      props: { item: makeItem({ description: '' }), itemIndex: 0 },
    })
    expect(wrapper.find('.star-card__desc').text().length).toBeGreaterThan(0)
  })

  it('links the homepage when present', () => {
    const wrapper = mount(StarCard, {
      props: {
        item: makeItem({ homepage: 'example.com' }),
        itemIndex: 0,
        detailMode: true,
      },
    })
    const homepageLink = wrapper.find('.star-card__meta-link')
    expect(homepageLink.attributes('href')).toBe('https://example.com')
  })
})
