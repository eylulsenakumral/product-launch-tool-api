# Product Launch Tool API

Cloudflare Workers API for Product Hunt launch preparation. Validate metadata and generate launch-ready markdown.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## 📡 Endpoints

### POST /api/validate

Validate launch metadata before publishing.

**Request:**
```json
{
  "name": "My Product",
  "tagline": "Best product ever",
  "description": "Amazing description",
  "makerComment": "Excited to launch!",
  "url": "https://example.com",
  "tags": "productivity, tools"
}
```

**Response (Success):**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "valid": false,
  "errors": [
    "name is required",
    "description must be 500 characters or less (currently 600)"
  ],
  "warnings": [
    "You have 7 tags (recommended: 5 or fewer)"
  ]
}
```

### POST /api/prepare

Generate launch-ready markdown.

**Request:**
```json
{
  "name": "My Product",
  "tagline": "Best product ever",
  "description": "Amazing description",
  "makerComment": "Excited to launch!",
  "url": "https://example.com",
  "tags": "productivity, tools"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "markdown": "# My Product\n\n**Best product ever**\n\n...",
    "preview": { ... },
    "warnings": []
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Product Launch Tool API",
  "version": "1.0.0"
}
```

## ✅ Validation Rules

| Field | Required | Max Length |
|-------|----------|------------|
| name | Yes | 60 chars |
| tagline | Yes | 80 chars |
| description | Yes | 500 chars |
| makerComment | Yes | 300 chars |
| url | No | 2048 chars |
| tags | No | 5 tags |

## 📚 Usage Examples

### JavaScript/TypeScript

```javascript
// Validate launch data
const response = await fetch('https://product-launch-tool-api.workers.dev/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Product',
    tagline: 'Best product ever',
    description: 'Amazing description',
    makerComment: 'Excited to launch!'
  })
})

const { valid, errors } = await response.json()

if (valid) {
  console.log('Ready to launch!')
}
```

### Python

```python
import requests

# Prepare launch markdown
response = requests.post(
    'https://product-launch-tool-api.workers.dev/api/prepare',
    json={
        'name': 'My Product',
        'tagline': 'Best product ever',
        'description': 'Amazing description',
        'makerComment': 'Excited to launch!',
        'url': 'https://example.com',
        'tags': 'productivity, tools'
    }
)

data = response.json()
print(data['data']['markdown'])
```

### cURL

```bash
# Generate launch markdown
curl -X POST https://product-launch-tool-api.workers.dev/api/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product",
    "tagline": "Best product ever",
    "description": "Amazing description",
    "makerComment": "Excited to launch!"
  }'
```

## 🔒 Security

- CORS enabled for all origins
- Input validation on all fields
- URL format validation
- No authentication required (public API)

## 🌐 Deployment

The API runs on Cloudflare Workers - a global edge network with:

- **Free tier:** 100,000 requests/day
- **Global distribution:** 300+ data centers
- **Auto-scaling:** Handles any traffic
- **HTTPS included:** Secure by default

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

This is an autonomous AI company project. Fork and create your own version!

---

Built by Auto Company - Make money legally.
