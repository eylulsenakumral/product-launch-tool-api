/**
 * Product Launch Tool API
 * Cloudflare Workers API for Product Hunt launch preparation
 */

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Validation rules
const VALIDATION_RULES = {
  name: { required: true, maxLength: 60 },
  tagline: { required: true, maxLength: 80 },
  description: { required: true, maxLength: 500 },
  makerComment: { required: true, maxLength: 300 },
  url: { required: false, maxLength: 2048 },
  tags: { required: false, maxTags: 5 },
};

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate launch data
function validateLaunchData(data) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const [field, rule] of Object.entries(VALIDATION_RULES)) {
    const value = data[field];

    // Required field check
    if (rule.required && (!value || typeof value !== 'string' || value.trim() === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip further validation if field is empty and not required
    if (!value || value.trim() === '') continue;

    // Length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${field} must be ${rule.maxLength} characters or less (currently ${value.length})`);
    }

    // URL validation
    if (field === 'url' && value && !isValidUrl(value)) {
      errors.push('url must be a valid URL');
    }

    // Tags validation
    if (field === 'tags' && value) {
      const tagList = value.split(',').map(t => t.trim()).filter(t => t);
      if (rule.maxTags && tagList.length > rule.maxTags) {
        warnings.push(`You have ${tagList.length} tags (recommended: ${rule.maxTags} or fewer)`);
      }
    }
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

// Generate markdown from launch data
function generateMarkdown(data) {
  const lines = [];

  // Title
  lines.push(`# ${data.name || 'Product Name'}`);
  lines.push('');

  // Tagline
  lines.push(`**${data.tagline || 'Your tagline here'}**`);
  lines.push('');

  // URL
  if (data.url) {
    lines.push(`**URL:** ${data.url}`);
    lines.push('');
  }

  // Description
  lines.push('## Description');
  lines.push('');
  lines.push(data.description || 'Product description goes here...');
  lines.push('');

  // Maker Comment
  lines.push('## Maker Comment');
  lines.push('');
  lines.push(data.makerComment || 'First comment from the maker...');
  lines.push('');

  // Tags
  if (data.tags) {
    lines.push(`**Tags:** ${data.tags}`);
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Drafted with Product Launch Tool*');

  return lines.join('\n');
}

// Handle OPTIONS request (CORS preflight)
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Handle POST /api/validate
async function handleValidate(request) {
  try {
    const data = await request.json();
    const validation = validateLaunchData(data);

    return Response.json({
      success: validation.isValid,
      valid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      data: validation.isValid ? data : null,
    }, {
      headers: CORS_HEADERS,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Invalid JSON',
      message: error.message,
    }, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
}

// Handle POST /api/prepare
async function handlePrepare(request) {
  try {
    const data = await request.json();
    const validation = validateLaunchData(data);

    if (!validation.isValid) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
        warnings: validation.warnings,
      }, {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const markdown = generateMarkdown(data);

    return Response.json({
      success: true,
      data: {
        markdown,
        preview: data,
        warnings: validation.warnings,
      },
    }, {
      headers: CORS_HEADERS,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Invalid JSON',
      message: error.message,
    }, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
}

// Handle GET /api/health
function handleHealth() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Product Launch Tool API',
    version: '1.0.0',
  }, {
    headers: CORS_HEADERS,
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Route requests
    if (path === '/api/health' && request.method === 'GET') {
      return handleHealth();
    }

    if (path === '/api/validate' && request.method === 'POST') {
      return handleValidate(request);
    }

    if (path === '/api/prepare' && request.method === 'POST') {
      return handlePrepare(request);
    }

    // 404 for unknown routes
    return Response.json({
      error: 'Not Found',
      message: 'Route not found',
      availableRoutes: [
        'GET /api/health',
        'POST /api/validate',
        'POST /api/prepare',
      ],
    }, {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
};
