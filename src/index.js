/**
 * Product Launch Tool API
 * Cloudflare Workers API for validating and preparing Product Hunt launch metadata
 */

// Validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    maxLength: 60,
    fieldName: "Product Name"
  },
  tagline: {
    required: true,
    maxLength: 80,
    fieldName: "Tagline"
  },
  description: {
    required: true,
    maxLength: 500,
    fieldName: "Description"
  },
  makerComment: {
    required: true,
    maxLength: 300,
    fieldName: "Maker Comment"
  },
  url: {
    required: false,
    fieldName: "URL"
  },
  tags: {
    required: false,
    maxTags: 5,
    fieldName: "Tags"
  }
}

/**
 * Validate URL format
 */
function isValidURL(url) {
  if (!url) return true // optional field
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate product launch data
 */
function validateProductData(data) {
  const errors = []
  const warnings = []

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Product Name is required'
    })
  } else if (data.name.length > VALIDATION_RULES.name.maxLength) {
    errors.push({
      field: 'name',
      message: `Product Name must be ${VALIDATION_RULES.name.maxLength} characters or less (current: ${data.name.length})`
    })
  }

  // Validate tagline
  if (!data.tagline || data.tagline.trim() === '') {
    errors.push({
      field: 'tagline',
      message: 'Tagline is required'
    })
  } else if (data.tagline.length > VALIDATION_RULES.tagline.maxLength) {
    errors.push({
      field: 'tagline',
      message: `Tagline must be ${VALIDATION_RULES.tagline.maxLength} characters or less (current: ${data.tagline.length})`
    })
  }

  // Validate description
  if (!data.description || data.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Description is required'
    })
  } else if (data.description.length > VALIDATION_RULES.description.maxLength) {
    errors.push({
      field: 'description',
      message: `Description must be ${VALIDATION_RULES.description.maxLength} characters or less (current: ${data.description.length})`
    })
  }

  // Validate maker comment
  if (!data.makerComment || data.makerComment.trim() === '') {
    errors.push({
      field: 'makerComment',
      message: 'Maker Comment is required'
    })
  } else if (data.makerComment.length > VALIDATION_RULES.makerComment.maxLength) {
    errors.push({
      field: 'makerComment',
      message: `Maker Comment must be ${VALIDATION_RULES.makerComment.maxLength} characters or less (current: ${data.makerComment.length})`
    })
  }

  // Validate URL (optional)
  if (data.url && !isValidURL(data.url)) {
    errors.push({
      field: 'url',
      message: 'URL must be a valid URL (e.g., https://example.com)'
    })
  }

  // Validate tags (optional)
  if (data.tags) {
    const tagList = data.tags.split(',').map(t => t.trim()).filter(t => t)
    if (tagList.length > VALIDATION_RULES.tags.maxTags) {
      warnings.push({
        field: 'tags',
        message: `Consider using ${VALIDATION_RULES.tags.maxTags} tags or fewer (current: ${tagList.length})`
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generate launch markdown
 */
function generateLaunchMarkdown(data) {
  const productName = data.name || 'Product Name'
  const tagline = data.tagline || 'Your tagline here'
  const description = data.description || 'Product description goes here...'
  const makerComment = data.makerComment || 'First comment from the maker...'

  let markdown = `# ${productName}

**${tagline}**

`

  if (data.url) {
    markdown += `**URL:** ${data.url}\n\n`
  }

  markdown += `## Description

${description}

## Maker Comment

${makerComment}
`

  if (data.tags) {
    markdown += `\n**Tags:** ${data.tags}\n`
  }

  markdown += `\n---

*Drafted with Product Launch Tool API*
`

  return markdown
}

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

/**
 * Handle OPTIONS request (CORS preflight)
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  })
}

/**
 * Handle POST /api/validate
 */
async function handleValidate(request) {
  try {
    const data = await request.json()

    const validation = validateProductData(data)

    return Response.json({
      success: validation.valid,
      data: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Invalid JSON payload'
    }, {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * Handle POST /api/prepare
 */
async function handlePrepare(request) {
  try {
    const data = await request.json()

    // First validate
    const validation = validateProductData(data)

    if (!validation.valid) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        data: {
          valid: false,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }, {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      })
    }

    // Generate markdown
    const markdown = generateLaunchMarkdown(data)

    return Response.json({
      success: true,
      data: {
        markdown,
        validated: true,
        warnings: validation.warnings
      }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Invalid JSON payload'
    }, {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * Handle GET /api/health
 */
function handleHealth() {
  return Response.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Handle 404
 */
function handleNotFound() {
  return Response.json({
    success: false,
    error: 'Endpoint not found'
  }, {
    status: 404,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Main request handler
 */
export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    // Route handling
    if (path === '/api/health' && request.method === 'GET') {
      return handleHealth()
    }

    if (path === '/api/validate' && request.method === 'POST') {
      return handleValidate(request)
    }

    if (path === '/api/prepare' && request.method === 'POST') {
      return handlePrepare(request)
    }

    // 404
    return handleNotFound()
  }
}
