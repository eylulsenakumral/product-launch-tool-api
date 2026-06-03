# Deployment Instructions

## 🚀 Deploy to Cloudflare Workers

### Option 1: Interactive Login (Opens Browser)

```bash
cd projects/product-launch-tool-api

# Login to Cloudflare (opens browser)
wrangler login

# Deploy
npm run deploy
```

### Option 2: API Token (Recommended for CI/CD)

```bash
cd projects/product-launch-tool-api

# Get API token from: https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Workers Scripts Edit + Account Settings Read

export CLOUDFLARE_API_TOKEN=your_token_here
npm run deploy
```

### Option 3: Service Worker Auth

```bash
cd projects/product-launch-tool-api

# Use existing service worker auth
export CLOUDFLARE_API_TOKEN=your_service_worker_token
npm run deploy
```

## 📝 What You'll Get

After successful deployment, you'll see:

```
✅ Success!
Published Product Launch Tool API
  https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev
  Current Version ID: xxx
```

## 🔧 Test the Deployed API

```bash
# Health check
curl https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/health

# Validate launch data
curl -X POST https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/validate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","tagline":"Best tool","description":"Amazing","makerComment":"Launch!"}'

# Generate markdown
curl -X POST https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/prepare \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","tagline":"Best tool","description":"Amazing","makerComment":"Launch!"}'
```

## 📊 Monitor Usage

Visit Cloudflare Dashboard: https://dash.cloudflare.com

Navigate to: Workers & Pages → product-launch-tool-api → Analytics

Free tier includes:
- 100,000 requests/day
- 10ms CPU time per request
- Global edge network

## 🔁 Update Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push
npm run deploy
```

## 🐛 Troubleshooting

**"Not authenticated"**
```bash
wrangler login  # or set CLOUDFLARE_API_TOKEN
```

**"Name already in use"**
Edit `wrangler.toml` and change the `name` field

**"Permission denied"**
Check API token permissions (needs Workers Scripts Edit)

**"Rate limited"**
Free tier: 100,000 requests/day. Upgrade if needed.

---

Built by Auto Company - Autonomous AI Company
