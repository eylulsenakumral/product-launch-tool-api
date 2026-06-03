# Product Launch Tool API - Examples

## Quick Start

### 1. Validate Launch Data

```javascript
const response = await fetch('https://product-launch-tool-api.workers.dev/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Awesome Product',
    tagline: 'The best way to do X',
    description: 'A detailed description that explains what your product does and why it matters...',
    makerComment: 'Excited to launch this today! Built this to solve a personal problem.',
    url: 'https://myproduct.com',
    tags: 'productivity, tools, saas'
  })
})

const { success, data } = await response.json()

if (data.valid) {
  console.log('✅ Validation passed')
  if (data.warnings.length > 0) {
    console.warn('Warnings:', data.warnings)
  }
} else {
  console.error('❌ Validation failed:', data.errors)
}
```

### 2. Generate Launch Markdown

```javascript
const response = await fetch('https://product-launch-tool-api.workers.dev/api/prepare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Awesome Product',
    tagline: 'The best way to do X',
    description: 'A detailed description...',
    makerComment: 'Excited to launch!',
    url: 'https://myproduct.com',
    tags: 'productivity, tools'
  })
})

const { success, data } = await response.json()

if (success) {
  console.log(data.markdown)
  // Download or copy to clipboard
}
```

### 3. Health Check

```javascript
const response = await fetch('https://product-launch-tool-api.workers.dev/api/health')
const { success, data } = await response.json()

console.log('API Status:', data.status)
console.log('Version:', data.version)
```

## Response Formats

### Success Response (Validation)

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "field": "tags",
        "message": "Consider using 5 tags or fewer (current: 6)"
      }
    ]
  }
}
```

### Error Response (Validation)

```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      {
        "field": "name",
        "message": "Product Name is required"
      },
      {
        "field": "tagline",
        "message": "Tagline is required"
      }
    ],
    "warnings": []
  }
}
```

### Success Response (Prepare)

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

### Error Response (Prepare with invalid data)

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

## Common Use Cases

### Web Form Integration

```html
<!DOCTYPE html>
<html>
<body>
  <form id="launchForm">
    <input type="text" name="name" placeholder="Product Name" required>
    <input type="text" name="tagline" placeholder="Tagline" required>
    <textarea name="description" placeholder="Description" required></textarea>
    <textarea name="makerComment" placeholder="Maker Comment" required></textarea>
    <input type="url" name="url" placeholder="URL">
    <input type="text" name="tags" placeholder="Tags (comma-separated)">
    <button type="submit">Generate Markdown</button>
  </form>

  <div id="result"></div>

  <script>
  document.getElementById('launchForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    const response = await fetch('https://product-launch-tool-api.workers.dev/api/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (result.success) {
      document.getElementById('result').innerHTML = `
        <h3>Generated Markdown:</h3>
        <pre>${result.data.markdown}</pre>
        <button onclick="copyToClipboard('${result.data.markdown}')">Copy</button>
      `
    } else {
      document.getElementById('result').innerHTML = `
        <p style="color: red">Errors: ${result.data.errors.map(e => e.message).join(', ')}</p>
      `
    }
  })
  </script>
</body>
</html>
```

### Node.js Integration

```javascript
// launch-tool.js
class ProductLaunchTool {
  constructor(apiUrl = 'https://product-launch-tool-api.workers.dev') {
    this.apiUrl = apiUrl
  }

  async validate(data) {
    const response = await fetch(`${this.apiUrl}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async prepare(data) {
    const response = await fetch(`${this.apiUrl}/api/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async checkHealth() {
    const response = await fetch(`${this.apiUrl}/api/health`)
    return response.json()
  }
}

// Usage
const tool = new ProductLaunchTool()

const result = await tool.prepare({
  name: 'My Product',
  tagline: 'Best product',
  description: 'Description',
  makerComment: 'Comment'
})

console.log(result.data.markdown)
```

### Python Integration

```python
import requests

class ProductLaunchTool:
    def __init__(self, api_url="https://product-launch-tool-api.workers.dev"):
        self.api_url = api_url

    def validate(self, data):
        response = requests.post(
            f"{self.api_url}/api/validate",
            json=data
        )
        return response.json()

    def prepare(self, data):
        response = requests.post(
            f"{self.api_url}/api/prepare",
            json=data
        )
        return response.json()

    def health(self):
        response = requests.get(f"{self.api_url}/api/health")
        return response.json()

# Usage
tool = ProductLaunchTool()

result = tool.prepare({
    "name": "My Product",
    "tagline": "Best product",
    "description": "Description",
    "makerComment": "Comment",
    "url": "https://example.com",
    "tags": "productivity, tools"
})

print(result['data']['markdown'])
```

### cURL Examples

```bash
# Validate
curl -X POST https://product-launch-tool-api.workers.dev/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product",
    "tagline": "Best product",
    "description": "Description",
    "makerComment": "Comment"
  }'

# Prepare
curl -X POST https://product-launch-tool-api.workers.dev/api/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product",
    "tagline": "Best product",
    "description": "Description",
    "makerComment": "Comment",
    "url": "https://example.com",
    "tags": "productivity, tools"
  }'

# Health check
curl https://product-launch-tool-api.workers.dev/api/health
```

## Error Handling

```javascript
try {
  const response = await fetch('https://product-launch-tool-api.workers.dev/api/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'API request failed')
  }

  if (!result.success) {
    console.error('Validation failed:', result.data.errors)
    return
  }

  console.log(result.data.markdown)
} catch (error) {
  console.error('Request failed:', error.message)
}
```

## Testing Locally

```bash
# Start local server
npx wrangler dev

# In another terminal, run tests
./test-local.sh
```
