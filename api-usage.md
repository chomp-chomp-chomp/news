# API Usage Guide

Complete guide for using the URL Shortener API programmatically.

---

## Quick Start

All API requests require an API key sent in the `X-API-Key` header.

### Basic Example

```bash
curl -X POST https://chom.pm/api/shorten \
  -H "X-API-Key: YOUR-API-KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/long/url"}'
```

**Response:**
```json
{
  "success": true,
  "shortCode": "abc123",
  "url": "https://example.com/long/url",
  "shortUrl": "https://chom.pm/abc123"
}
```

---

## Authentication

Every API request must include your API key in the `X-API-Key` header:

```http
X-API-Key: your-api-key-here
```

### Get Your API Key

Your API key is the value you set when deploying the worker:
- In Cloudflare Dashboard: **Workers & Pages** → **chomp-urls** → **Settings** → **Variables**
- Look for the `API_KEY` secret you created

---

## Endpoints

### POST /api/shorten

Create a new short URL.

**Request:**
```http
POST /api/shorten
Content-Type: application/json
X-API-Key: your-api-key-here

{
  "url": "https://example.com/very/long/url",
  "shortCode": "custom" // Optional
}
```

**Parameters:**
- `url` (required): The long URL to shorten. Must start with http:// or https://
- `shortCode` (optional): Custom short code (3-20 characters: letters, numbers, _, -)

**Success Response (200):**
```json
{
  "success": true,
  "shortCode": "abc123",
  "url": "https://example.com/very/long/url",
  "shortUrl": "https://chom.pm/abc123"
}
```

**Error Responses:**

**401 - Invalid API Key:**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**400 - Missing URL:**
```json
{
  "success": false,
  "error": "URL is required"
}
```

**400 - Invalid URL:**
```json
{
  "success": false,
  "error": "Invalid URL format. URL must start with http:// or https://"
}
```

**409 - Short Code Exists:**
```json
{
  "success": false,
  "error": "Short code already exists"
}
```

**400 - Invalid Short Code:**
```json
{
  "success": false,
  "error": "Invalid short code. Use 3-20 characters: letters, numbers, underscore, or hyphen"
}
```

---

## Code Examples

### JavaScript / Node.js

```javascript
async function shortenUrl(longUrl, customCode = null) {
  const response = await fetch('https://chom.pm/api/shorten', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key-here',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: longUrl,
      ...(customCode && { shortCode: customCode })
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('Short URL:', data.shortUrl);
    return data.shortUrl;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
shortenUrl('https://example.com/long/url')
  .then(shortUrl => console.log('Created:', shortUrl));

shortenUrl('https://example.com/newsletter', 'news-jan-2026')
  .then(shortUrl => console.log('Created:', shortUrl));
```

### Python

```python
import requests

def shorten_url(long_url, custom_code=None):
    url = 'https://chom.pm/api/shorten'
    headers = {
        'X-API-Key': 'your-api-key-here',
        'Content-Type': 'application/json'
    }

    payload = {'url': long_url}
    if custom_code:
        payload['shortCode'] = custom_code

    response = requests.post(url, headers=headers, json=payload)
    data = response.json()

    if data.get('success'):
        print(f"Short URL: {data['shortUrl']}")
        return data['shortUrl']
    else:
        print(f"Error: {data.get('error')}")
        raise Exception(data.get('error'))

# Usage
shorten_url('https://example.com/long/url')
shorten_url('https://example.com/newsletter', 'news-jan-2026')
```

### PHP

```php
<?php
function shortenUrl($longUrl, $customCode = null) {
    $url = 'https://chom.pm/api/shorten';

    $payload = ['url' => $longUrl];
    if ($customCode) {
        $payload['shortCode'] = $customCode;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: your-api-key-here',
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($data['success']) {
        echo "Short URL: " . $data['shortUrl'] . "\n";
        return $data['shortUrl'];
    } else {
        echo "Error: " . $data['error'] . "\n";
        throw new Exception($data['error']);
    }
}

// Usage
shortenUrl('https://example.com/long/url');
shortenUrl('https://example.com/newsletter', 'news-jan-2026');
?>
```

### Ruby

```ruby
require 'net/http'
require 'json'
require 'uri'

def shorten_url(long_url, custom_code = nil)
  uri = URI('https://chom.pm/api/shorten')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true

  request = Net::HTTP::Post.new(uri.path)
  request['X-API-Key'] = 'your-api-key-here'
  request['Content-Type'] = 'application/json'

  payload = { url: long_url }
  payload[:shortCode] = custom_code if custom_code
  request.body = payload.to_json

  response = http.request(request)
  data = JSON.parse(response.body)

  if data['success']
    puts "Short URL: #{data['shortUrl']}"
    data['shortUrl']
  else
    puts "Error: #{data['error']}"
    raise data['error']
  end
end

# Usage
shorten_url('https://example.com/long/url')
shorten_url('https://example.com/newsletter', 'news-jan-2026')
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type ShortenRequest struct {
    URL       string `json:"url"`
    ShortCode string `json:"shortCode,omitempty"`
}

type ShortenResponse struct {
    Success   bool   `json:"success"`
    ShortCode string `json:"shortCode,omitempty"`
    URL       string `json:"url,omitempty"`
    ShortURL  string `json:"shortUrl,omitempty"`
    Error     string `json:"error,omitempty"`
}

func shortenURL(longURL, customCode string) (string, error) {
    reqBody := ShortenRequest{
        URL:       longURL,
        ShortCode: customCode,
    }

    jsonData, err := json.Marshal(reqBody)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", "https://chom.pm/api/shorten", bytes.NewBuffer(jsonData))
    if err != nil {
        return "", err
    }

    req.Header.Set("X-API-Key", "your-api-key-here")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    var result ShortenResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return "", err
    }

    if result.Success {
        fmt.Println("Short URL:", result.ShortURL)
        return result.ShortURL, nil
    }

    return "", fmt.Errorf("error: %s", result.Error)
}

func main() {
    shortenURL("https://example.com/long/url", "")
    shortenURL("https://example.com/newsletter", "news-jan-2026")
}
```

---

## Common Use Cases

### 1. Shorten Links in Email Campaigns

```python
# Shorten all links before sending newsletter
import requests

def prepare_newsletter(content, links):
    for original_link in links:
        short_url = shorten_url(original_link)
        content = content.replace(original_link, short_url)
    return content

newsletter = prepare_newsletter(
    newsletter_html,
    ['https://example.com/product/123', 'https://example.com/sale']
)
```

### 2. Social Media Auto-Poster

```javascript
async function postToTwitter(text, url) {
  // Shorten URL first
  const shortUrl = await shortenUrl(url);

  // Post to Twitter with short URL
  const tweet = `${text} ${shortUrl}`;
  await twitterAPI.post(tweet);
}
```

### 3. QR Code Generator

```python
import qrcode

def create_qr_with_short_url(long_url, filename):
    # Shorten the URL first
    short_url = shorten_url(long_url)

    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(short_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)

    return short_url

# Usage
short = create_qr_with_short_url('https://example.com/product', 'qr.png')
print(f"QR code saved! Scans to: {short}")
```

### 4. Batch URL Shortening

```javascript
async function shortenBatch(urls) {
  const results = await Promise.all(
    urls.map(url => shortenUrl(url))
  );
  return results;
}

// Usage
const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3'
];

shortenBatch(urls).then(shortUrls => {
  console.log('All URLs shortened:', shortUrls);
});
```

### 5. Analytics Integration

```python
import requests
from datetime import datetime

def track_and_shorten(url, campaign_name):
    # Add tracking parameters
    tracked_url = f"{url}?utm_source=short&utm_campaign={campaign_name}"

    # Shorten with custom code
    custom_code = f"{campaign_name}-{datetime.now().strftime('%Y%m')}"
    short_url = shorten_url(tracked_url, custom_code)

    # Save to your database
    save_campaign_link(campaign_name, short_url, tracked_url)

    return short_url

# Usage
track_and_shorten('https://example.com/sale', 'jan-sale')
# Creates: https://chom.pm/jan-sale-202601
```

---

## Rate Limiting

Currently there's no rate limiting implemented, but best practices:

- **Don't** hammer the API with thousands of requests per second
- **Do** implement retry logic with exponential backoff
- **Do** cache short URLs when possible
- **Do** batch requests when shortening multiple URLs

Example retry logic:

```javascript
async function shortenWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await shortenUrl(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## Security Best Practices

### 1. Keep Your API Key Secret

- ✅ Store in environment variables
- ✅ Use secret management services
- ❌ Don't commit to git
- ❌ Don't expose in client-side code

### 2. Validate Input

```javascript
function isValidUrl(url) {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

// Use before calling API
if (isValidUrl(userInput)) {
  shortenUrl(userInput);
}
```

### 3. Handle Errors Gracefully

```python
try:
    short_url = shorten_url(long_url)
    print(f"Success: {short_url}")
except requests.exceptions.RequestException as e:
    print(f"Network error: {e}")
except Exception as e:
    print(f"Error: {e}")
```

---

## Testing

### Test with cURL

```bash
# Test basic shortening
curl -X POST https://chom.pm/api/shorten \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'

# Test with custom code
curl -X POST https://chom.pm/api/shorten \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "shortCode": "test123"}'

# Test invalid API key
curl -X POST https://chom.pm/api/shorten \
  -H "X-API-Key: wrong-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

### Test with Postman

1. Create new POST request
2. URL: `https://chom.pm/api/shorten`
3. Headers:
   - `X-API-Key`: `your-api-key`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "url": "https://example.com/test",
  "shortCode": "test"
}
```

---

## Webhooks / Callbacks

Currently not supported, but could be added. Let me know if you need this feature!

---

## Support

Questions or issues?
- Check the main [README.md](README.md)
- Review [example-usage.md](example-usage.md)
- Open an issue on GitHub

---

## Summary

✅ Simple REST API
✅ One endpoint for URL shortening
✅ Optional custom short codes
✅ JSON responses
✅ CORS enabled
✅ API key authentication

Happy shortening! 🚀
