# Deployment Instructions

## Prerequisites

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```
   This will open a browser for authentication.

   OR create an API token at https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ and set:
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   ```

## Deploy

### Option 1: Using npm script
```bash
cd /home/tolgabrk/projects/Auto-Company/projects/product-launch-tool-api
npm run deploy
```

### Option 2: Using wrangler directly
```bash
cd /home/tolgabrk/projects/Auto-Company/projects/product-launch-tool-api
npx wrangler deploy
```

### Option 3: With explicit config
```bash
npx wrangler deploy --config wrangler.toml src/index.js
```

## After Deployment

Once deployed successfully, you'll get output like:
```
Published product-launch-tool-api (X.X sec)
  https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev
```

Use this URL for API calls:
- https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/validate
- https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/prepare
- https://product-launch-tool-api.YOUR_SUBDOMAIN.workers.dev/api/health

## Custom Domain (Optional)

To use a custom domain:
```bash
npx wrangler domains add your-api.yourdomain.com
```

## Local Development

Test locally before deploying:
```bash
npx wrangler dev
```

API will be available at `http://localhost:8787`
