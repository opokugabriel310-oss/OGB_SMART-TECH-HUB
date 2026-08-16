# Smart Tech Hub AI - Setup & Deployment Guide

## 📋 Overview

This guide walks you through setting up and deploying the Smart Tech Hub AI Assistant with real AI API integration.

**Files involved:**
- `system_prompt` - AI behavior guidelines
- `ai-backend.js` - LLM API handler
- `ai-assistant.html` - Chat widget frontend

---

## 🚀 Quick Start (5 minutes)

### Step 1: Choose Your AI Provider

The system supports three options:

#### Option A: **OpenAI** (Recommended - Easiest)
- Most reliable and powerful
- Costs ~$0.01-0.05 per chat interaction
- Requires: OpenAI API key

#### Option B: **Hugging Face** (Free option)
- Free tier available
- Good for development/testing
- Requires: Hugging Face API key

#### Option C: **Custom Backend** (Advanced)
- Run your own AI server
- More control, no external costs
- Requires: Backend infrastructure

---

## 🔧 Setup Instructions

### A. OpenAI Setup (Recommended)

#### 1. Get API Key
```bash
# Go to https://platform.openai.com/api-keys
# Create new secret key
# Copy and save it somewhere secure
```

#### 2. Update ai-backend.js
```javascript
// In ai-backend.js, change:
provider: 'openai'

// Update model (optional):
models: {
    openai: 'gpt-4-turbo' // or 'gpt-3.5-turbo' (cheaper)
}
```

#### 3. Store API Key Securely

**Option A: Environment Variables (Best)**
```bash
# Create a .env file in your project root
OPENAI_API_KEY=sk-your-key-here-xxxxx

# Install dotenv package
npm install dotenv

# Load in your Node.js server:
require('dotenv').config();
```

**Option B: Server-side Proxy (Recommended for Production)**
```
Create a backend endpoint that:
1. Accepts chat messages from frontend
2. Calls OpenAI API with your key
3. Returns response to frontend
4. API key never exposed to client
```

#### 4. Test Connection
```javascript
// Call from browser console:
await generateAIResponse("Hello, what can you help me with?");
```

---

### B. Hugging Face Setup (Free Alternative)

#### 1. Get API Key
```bash
# Go to https://huggingface.co/settings/tokens
# Create new read token
# Copy and save
```

#### 2. Update ai-backend.js
```javascript
provider: 'huggingface'

// Model options:
models: {
    huggingface: 'meta-llama/Llama-2-7b-chat-hf' // Free on Hugging Face
}
```

#### 3. Store API Key
```bash
# Same as OpenAI - use .env or backend proxy
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
```

---

### C. Custom Backend Setup (Advanced)

#### 1. Create Backend Server

**Example with Node.js/Express:**
```javascript
// server.js
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/ai/generate', async (req, res) => {
    const { messages, config } = req.body;
    
    try {
        // Call your LLM here (OpenAI, local model, etc)
        const response = await callYourLLM(messages, config);
        
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('AI Backend running on port 3000');
});
```

#### 2. Deploy Backend
- **Local**: `node server.js`
- **Heroku**: Push to Heroku with Procfile
- **Vercel**: Deploy as serverless function
- **Railway**: Simple deployment platform
- **Render**: Easy cloud deployment

---

## 📝 Implementation in HTML

### Add to your HTML page:

```html
<!-- In <head> -->
<script src="ai-backend.js"></script>

<!-- Your existing ai-assistant.html content -->
```

### Modify ai-assistant.html Chat Handler

Replace the `generateAIResponse()` function call with:

```javascript
// OLD (local knowledge base):
function generateAIResponse(userMessage) {
    for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
        if (matchesKeywords(userMessage, data.keywords)) {
            return getRandomElement(data.responses);
        }
    }
    return getRandomElement(KNOWLEDGE_BASE.help.responses);
}

// NEW (real AI):
async function generateAIResponse(userMessage) {
    // Validate input for safety
    const validation = validateUserInput(userMessage);
    if (!validation.valid) {
        return getFallbackResponse("I can't help with that topic.");
    }
    
    // Get conversation history
    const conversationHistory = chatHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
    }));
    
    // Get AI response
    const aiResponse = await generateAIResponse(userMessage, conversationHistory);
    
    // Format with Smart Tech Hub guidelines
    return formatResponse(aiResponse);
}
```

---

## 🔐 Security Best Practices

### 1. Never Expose API Keys
```javascript
// ❌ WRONG - Keys visible to everyone
const API_KEY = "sk-xxxxx";

// ✅ CORRECT - Use backend proxy
fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage })
})
```

### 2. Environment Variables
```bash
# .env (never commit this!)
OPENAI_API_KEY=sk_xxxxxx
HUGGINGFACE_API_KEY=hf_xxxxx

# .gitignore
.env
.env.local
node_modules/
```

### 3. Rate Limiting
```javascript
// Prevent abuse - limit requests per user
const rateLimitMap = new Map();

function checkRateLimit(userId) {
    const now = Date.now();
    const lastRequest = rateLimitMap.get(userId) || 0;
    
    if (now - lastRequest < 1000) { // Min 1 second between requests
        return false;
    }
    
    rateLimitMap.set(userId, now);
    return true;
}
```

### 4. Input Validation
```javascript
// The system already does this with validateUserInput()
// It blocks messages containing:
// - hack, crack, keygen, bypass, exploit
// - password, pin, secret key
// - malware, virus, trojan
```

---

## 💰 Cost Estimation

### OpenAI Pricing
```
GPT-4 Turbo: ~$0.03 per 1K input tokens
             ~$0.06 per 1K output tokens

Typical conversation: 500-1000 tokens total
Cost per chat: $0.02-0.05

100 chats/day = $2-5/day = $60-150/month
```

**To Save Money:**
- Use GPT-3.5-turbo instead (10x cheaper)
- Add caching for common questions
- Implement rate limiting

---

## 🧪 Testing

### Test Locally
```javascript
// In browser console:

// Test 1: Basic greeting
await generateAIResponse("Hi");

// Test 2: Apps question
await generateAIResponse("What apps do you recommend?");

// Test 3: Earning question
await generateAIResponse("How can I make money online?");

// Test 4: Suspicious input (should be rejected)
await generateAIResponse("How do I hack this system?");
```

### Check System Prompt Loading
```javascript
// Verify system prompt is loaded:
const prompt = await loadSystemPrompt();
console.log(prompt.substring(0, 100)); // Should show start of prompt
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load system_prompt"
```javascript
// Solution: Check file exists at root
// File should be at: /system_prompt (not /system_prompt.txt)

// Or update the fetch path:
const response = await fetch('./system_prompt');
```

### Issue: API returns 401 Unauthorized
```
Solution: Check API key
- Confirm key is correct
- Check it's not expired
- Verify it has correct permissions
- Make sure it's in .env file (if using local)
```

### Issue: Slow responses
```
Solution: Optimize
- Reduce maxTokens (currently 500)
- Use faster model (gpt-3.5-turbo instead of gpt-4)
- Implement response caching
- Use streaming for real-time feel
```

### Issue: Responses don't follow system_prompt
```
Solution: 
- Clear any cached responses
- Verify system_prompt file is loading
- Check that provider is correctly set
- Test with: console.log(await loadSystemPrompt());
```

---

## 📊 Monitoring & Logging

### Add Logging
```javascript
async function generateAIResponse(userMessage, conversationHistory = []) {
    console.log('📨 User:', userMessage);
    
    const response = await callAIProvider(messages);
    console.log('🤖 AI:', response.substring(0, 100) + '...');
    
    return response;
}
```

### Track Metrics
```javascript
// Count interactions
let totalChats = 0;
let successfulResponses = 0;
let failedResponses = 0;

// Log to dashboard (e.g., Google Analytics)
gtag('event', 'ai_chat', {
    message_length: userMessage.length,
    response_length: response.length
});
```

---

## 🚀 Deployment Checklist

- [ ] Choose AI provider (OpenAI/HuggingFace/Custom)
- [ ] Get API key
- [ ] Set up .env with API key
- [ ] Test locally with test queries
- [ ] Update ai-backend.js provider setting
- [ ] Integrate with ai-assistant.html
- [ ] Test all features (greeting, apps, money, gaming, help)
- [ ] Set up rate limiting
- [ ] Enable security checks
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Set up logging/analytics

---

## 📱 Production Deployment

### Recommended Stack:
```
Frontend: GitHub Pages / Vercel / Netlify
Backend: Vercel Functions / AWS Lambda / Railway
AI Provider: OpenAI API
Database: Firebase / MongoDB Atlas
```

### Deploy Backend to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add OPENAI_API_KEY or HUGGINGFACE_API_KEY
```

### Deploy Frontend to Vercel:
```bash
vercel --prod
```

---

## 📞 Support & Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Hugging Face Docs**: https://huggingface.co/docs
- **Smart Tech Hub**: Contact via `contact.html`
- **Issues**: Report in GitHub Issues

---

## 🎓 Next Steps

1. **Customize System Prompt**: Edit `system_prompt` for your needs
2. **Add More Features**: Implement chat history UI, file uploads, etc.
3. **Improve Responses**: Fine-tune temperature and model settings
4. **Scale**: Add caching, database, user authentication

---

**Last Updated**: 2026-08-16
**Version**: 1.0
