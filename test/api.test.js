/**
 * API tests for Product Launch Tool
 */

import { describe, it, expect } from 'vitest'

// Mock Cloudflare Workers environment
const mockEnv = {}

function validateProductData(data) {
  const VALIDATION_RULES = {
    name: { required: true, maxLength: 60, fieldName: "Product Name" },
    tagline: { required: true, maxLength: 80, fieldName: "Tagline" },
    description: { required: true, maxLength: 500, fieldName: "Description" },
    makerComment: { required: true, maxLength: 300, fieldName: "Maker Comment" },
    url: { required: false, fieldName: "URL" },
    tags: { required: false, maxTags: 5, fieldName: "Tags" }
  }

  const errors = []
  const warnings = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Product Name is required' })
  } else if (data.name.length > VALIDATION_RULES.name.maxLength) {
    errors.push({ field: 'name', message: `Product Name must be ${VALIDATION_RULES.name.maxLength} characters or less` })
  }

  if (!data.tagline || data.tagline.trim() === '') {
    errors.push({ field: 'tagline', message: 'Tagline is required' })
  } else if (data.tagline.length > VALIDATION_RULES.tagline.maxLength) {
    errors.push({ field: 'tagline', message: `Tagline must be ${VALIDATION_RULES.tagline.maxLength} characters or less` })
  }

  if (!data.description || data.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required' })
  } else if (data.description.length > VALIDATION_RULES.description.maxLength) {
    errors.push({ field: 'description', message: `Description must be ${VALIDATION_RULES.description.maxLength} characters or less` })
  }

  if (!data.makerComment || data.makerComment.trim() === '') {
    errors.push({ field: 'makerComment', message: 'Maker Comment is required' })
  } else if (data.makerComment.length > VALIDATION_RULES.makerComment.maxLength) {
    errors.push({ field: 'makerComment', message: `Maker Comment must be ${VALIDATION_RULES.makerComment.maxLength} characters or less` })
  }

  if (data.url) {
    try {
      new URL(data.url)
    } catch {
      errors.push({ field: 'url', message: 'URL must be a valid URL' })
    }
  }

  if (data.tags) {
    const tagList = data.tags.split(',').map(t => t.trim()).filter(t => t)
    if (tagList.length > VALIDATION_RULES.tags.maxTags) {
      warnings.push({ field: 'tags', message: `Consider using ${VALIDATION_RULES.tags.maxTags} tags or fewer` })
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

function generateLaunchMarkdown(data) {
  const productName = data.name || 'Product Name'
  const tagline = data.tagline || 'Your tagline here'
  const description = data.description || 'Product description goes here...'
  const makerComment = data.makerComment || 'First comment from the maker...'

  let markdown = `# ${productName}\n\n**${tagline}**\n\n`

  if (data.url) {
    markdown += `**URL:** ${data.url}\n\n`
  }

  markdown += `## Description\n\n${description}\n\n## Maker Comment\n\n${makerComment}\n`

  if (data.tags) {
    markdown += `\n**Tags:** ${data.tags}\n`
  }

  markdown += `\n---\n\n*Drafted with Product Launch Tool API*\n`

  return markdown
}

describe('Product Launch Tool API', () => {
  describe('Validation', () => {
    it('should validate complete valid data', () => {
      const data = {
        name: 'My Product',
        tagline: 'Best product ever',
        description: 'Amazing product description',
        makerComment: 'Excited to launch!',
        url: 'https://example.com',
        tags: 'productivity, tools'
      }

      const result = validateProductData(data)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject missing required fields', () => {
      const data = {
        name: '',
        tagline: '',
        description: '',
        makerComment: ''
      }

      const result = validateProductData(data)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors.map(e => e.field)).toContain('name')
      expect(result.errors.map(e => e.field)).toContain('tagline')
      expect(result.errors.map(e => e.field)).toContain('description')
      expect(result.errors.map(e => e.field)).toContain('makerComment')
    })

    it('should enforce character limits', () => {
      const data = {
        name: 'A'.repeat(61),
        tagline: 'B'.repeat(81),
        description: 'C'.repeat(501),
        makerComment: 'D'.repeat(301)
      }

      const result = validateProductData(data)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(4)
    })

    it('should reject invalid URL format', () => {
      const data = {
        name: 'My Product',
        tagline: 'Best product',
        description: 'Description',
        makerComment: 'Comment',
        url: 'not-a-url'
      }

      const result = validateProductData(data)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'url')).toBe(true)
    })

    it('should warn about too many tags', () => {
      const data = {
        name: 'My Product',
        tagline: 'Best product',
        description: 'Description',
        makerComment: 'Comment',
        tags: 'one, two, three, four, five, six'
      }

      const result = validateProductData(data)

      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.field === 'tags')).toBe(true)
    })
  })

  describe('Markdown Generation', () => {
    it('should generate complete markdown', () => {
      const data = {
        name: 'My Product',
        tagline: 'Best product ever',
        description: 'Amazing description',
        makerComment: 'Excited to launch!',
        url: 'https://example.com',
        tags: 'productivity, tools'
      }

      const markdown = generateLaunchMarkdown(data)

      expect(markdown).toContain('# My Product')
      expect(markdown).toContain('**Best product ever**')
      expect(markdown).toContain('**URL:** https://example.com')
      expect(markdown).toContain('Amazing description')
      expect(markdown).toContain('Excited to launch!')
      expect(markdown).toContain('**Tags:** productivity, tools')
    })

    it('should generate markdown without optional fields', () => {
      const data = {
        name: 'My Product',
        tagline: 'Best product',
        description: 'Description',
        makerComment: 'Comment'
      }

      const markdown = generateLaunchMarkdown(data)

      expect(markdown).toContain('# My Product')
      expect(markdown).not.toContain('**URL:**')
      expect(markdown).not.toContain('**Tags:**')
    })
  })
})
