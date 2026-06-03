# Product Launch Tool API

Cloudflare Workers API for validating and preparing Product Hunt launch metadata.

## Endpoints

### POST /api/validate

Validate product launch metadata.

**Request:**
```json
{
  "name": "My Awesome Product",
  "tagline": "The best way to do X",
  "description": "A detailed description of the product...",
  "makerComment": "First comment from the maker...",
  "url": "https://example.com",
  "tags": "productivity, tools, saas"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

**Response (Validation Errors):**
```json
{
  "success": false,
  "data": {
    "valid": false,
    "errors": [
      {
        "field": "name",
        "message": "Product Name is required"
      }
    ],
    "warnings": []
  }
}
```

### POST /api/prepare

Validate and generate launch markdown.

**Request:** Same as `/api/validate`

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "markdown": "# My Awesome Product\n\n**The best way to do X**\n\n...",
    "validated": true,
    "warnings": []
  }
}
```

**Response (Validation Failed):**
```json
{
  "success": false,
  "error": "Validation failed",
  "data": {
    "valid": false,
    "errors": [...],
    "warnings": [...]
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Validation Rules

| Field | Required | Max Length | Notes |
|-------|----------|------------|-------|
| name | Yes | 60 chars | Product name |
| tagline | Yes | 80 chars | Short tagline |
| description | Yes | 500 chars | Detailed description |
| makerComment | Yes | 300 chars | First maker comment |
| url | No | - | Must be valid URL format |
| tags | No | 5 tags | Comma-separated |

## Example Usage

### cURL

```bash
# Validate
curl -X POST https://product-launch-tool-api.workers.dev/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product",
    "tagline": "Best product ever",
    "description": "Amazing product description",
    "makerComment": "Excited to launch!"
  }'

# Prepare markdown
curl -X POST https://product-launch-tool-api.workers.dev/api/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product",
    "tagline": "Best product ever",
    "description": "Amazing product description",
    "makerComment": "Excited to launch!",
    "url": "https://example.com",
    "tags": "productivity, tools"
  }'

# Health check
curl https://product-launch-tool-api.workers.dev/api/health
```

### JavaScript

```javascript
// Validate
const response = await fetch('https://product-launch-tool-api.workers.dev/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Product',
    tagline: 'Best product ever',
    description: 'Amazing product description',
    makerComment: 'Excited to launch!'
  })
})

const { success, data } = await response.json()
console.log(data.valid, data.errors, data.warnings)
```

### Python

```python
import requests

# Prepare markdown
response = requests.post(
    'https://product-launch-tool-api.workers.dev/api/prepare',
    json={
        'name': 'My Product',
        'tagline': 'Best product ever',
        'description': 'Amazing product description',
        'makerComment': 'Excited to launch!',
        'url': 'https://example.com',
        'tags': 'productivity, tools'
    }
)

result = response.json()
print(result['data']['markdown'])
```

## Deployment

### Prerequisites

```bash
npm install -g wrangler
wrangler login
```

### Deploy

```bash
npm install
npm run deploy
```

### Local Development

```bash
npm run dev
```

## CORS

This API supports CORS for web usage. All origins are allowed with standard headers:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## License

MIT
