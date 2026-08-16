/**
 * ============================================
 * SMART TECH HUB AI BACKEND
 * LLM API Integration Handler
 * ============================================
 * 
 * This backend handles communication between the chat widget
 * and AI LLM services, ensuring the system_prompt guidelines
 * are followed for all responses.
 */

// Configuration for AI API
const AI_API_CONFIG = {
    // Options: 'openai', 'huggingface', 'custom'
    provider: 'openai',
    
    // API Keys (stored server-side for security)
    endpoints: {
        openai: 'https://api.openai.com/v1/chat/completions',
        huggingface: 'https://api-inference.huggingface.co/models/',
        custom: '/api/ai/generate' // Your custom backend endpoint
    },
    
    // Model configurations
    models: {
        openai: 'gpt-4-turbo',
        huggingface: 'meta-llama/Llama-2-7b-chat-hf',
        custom: 'smart-tech-hub-v1'
    },
    
    // Safety settings
    maxTokens: 500,
    temperature: 0.7, // Balanced between deterministic and creative
    topP: 0.9
};

/**
 * Load system prompt from repository
 */
async function loadSystemPrompt() {
    try {
        const response = await fetch('./system_prompt');
        if (!response.ok) throw new Error('Failed to load system_prompt');
        return await response.text();
    } catch (error) {
        console.error('Error loading system prompt:', error);
        return getDefaultSystemPrompt();
    }
}

/**
 * Default system prompt if file loading fails
 */
function getDefaultSystemPrompt() {
    return `You are Smart Tech AI, the official digital assistant for Smart Tech Hub.

You are helpful, honest, practical, and customer-focused.

CORE MISSION:
- Help visitors understand technology
- Discover useful resources
- Solve problems
- Navigate Smart Tech Hub easily

PERSONALITY:
- Friendly but professional
- Clear explanations
- Patient and helpful
- Technology-focused

GOLDEN RULE: NEVER PRETEND
- Never fabricate apps, websites, companies, prices, or features
- Always be honest about uncertainty
- Prefer accuracy over confidence

WEBSITE PAGES:
- money.html (earning opportunities)
- gaming.html (gaming content)
- apps.html (applications)
- help.html (general help)
- contact.html (contact info)
- about.html (about us)
- index.html (home)

RESPONSE GUIDELINES:
- Use emojis sparingly and appropriately
- Direct users to Smart Tech Hub pages when relevant
- For apps: recommend officially available, reputable options
- For earning: never guarantee income, warn about scams
- For gaming: help with optimization, never encourage cheating
- For troubleshooting: start simple, escalate gradually

Always make technology feel less complicated.`;
}

/**
 * Generate AI response using configured LLM provider
 */
async function generateAIResponse(userMessage, conversationHistory = []) {
    try {
        const systemPrompt = await loadSystemPrompt();
        
        // Format conversation history for API
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];
        
        // Determine which provider to use
        const provider = AI_API_CONFIG.provider;
        
        if (provider === 'openai') {
            return await callOpenAI(messages);
        } else if (provider === 'huggingface') {
            return await callHuggingFace(messages);
        } else if (provider === 'custom') {
            return await callCustomBackend(messages);
        }
        
    } catch (error) {
        console.error('AI Response Generation Error:', error);
        return getFallbackResponse(userMessage);
    }
}

/**
 * Call OpenAI API
 * Requires: OPENAI_API_KEY environment variable
 */
async function callOpenAI(messages) {
    const response = await fetch(AI_API_CONFIG.endpoints.openai, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: AI_API_CONFIG.models.openai,
            messages: messages,
            max_tokens: AI_API_CONFIG.maxTokens,
            temperature: AI_API_CONFIG.temperature,
            top_p: AI_API_CONFIG.topP
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Call Hugging Face Inference API
 * Requires: HUGGINGFACE_API_KEY environment variable
 */
async function callHuggingFace(messages) {
    const prompt = formatMessagesAsText(messages);
    
    const response = await fetch(
        `${AI_API_CONFIG.endpoints.huggingface}${AI_API_CONFIG.models.huggingface}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: AI_API_CONFIG.maxTokens,
                    temperature: AI_API_CONFIG.temperature,
                    top_p: AI_API_CONFIG.topP
                }
            })
        }
    );
    
    if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0].generated_text;
}

/**
 * Call custom backend endpoint
 * Expects a local backend server at /api/ai/generate
 */
async function callCustomBackend(messages) {
    const response = await fetch(AI_API_CONFIG.endpoints.custom, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: messages,
            config: {
                maxTokens: AI_API_CONFIG.maxTokens,
                temperature: AI_API_CONFIG.temperature,
                topP: AI_API_CONFIG.topP
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`Custom backend error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
}

/**
 * Format messages for text-based LLM input
 */
function formatMessagesAsText(messages) {
    return messages.map(msg => {
        const role = msg.role.toUpperCase();
        return `${role}: ${msg.content}`;
    }).join('\n\n');
}

/**
 * Fallback response if AI service is unavailable
 */
function getFallbackResponse(userMessage) {
    const fallbackResponses = {
        greeting: "👋 Welcome to Smart Tech Hub! I'm Smart Tech AI. I can help you discover apps, solve technology problems, explore gaming, and learn about digital tools. What are you looking for?",
        money: "💰 Great question about earning! Check out our <a href='money.html'>Money & Income section</a> for legitimate opportunities and guidance.",
        apps: "📱 Looking for apps? Visit our <a href='apps.html'>Apps section</a> for detailed reviews and recommendations.",
        gaming: "🎮 Interested in gaming? Explore our <a href='gaming.html'>Gaming Hub</a> for guides, optimization tips, and reviews.",
        help: "I'm here to help! If you're looking for more information, check out our <a href='help.html'>Help Center</a> or feel free to ask your question differently.",
        default: "I appreciate your question! Our Smart Tech Hub covers technology, apps, gaming, earning opportunities, and digital skills. How can I help you explore these topics?"
    };
    
    const normalizedMessage = userMessage.toLowerCase();
    
    if (normalizedMessage.match(/hi|hello|hey|greet/)) {
        return fallbackResponses.greeting;
    } else if (normalizedMessage.match(/money|earn|income|cash/)) {
        return fallbackResponses.money;
    } else if (normalizedMessage.match(/app|android|ios|download/)) {
        return fallbackResponses.apps;
    } else if (normalizedMessage.match(/game|gaming|play|fps/)) {
        return fallbackResponses.gaming;
    } else if (normalizedMessage.match(/help|support|faq|guide/)) {
        return fallbackResponses.help;
    }
    
    return fallbackResponses.default;
}

/**
 * Process user input for safety and guidelines compliance
 */
function validateUserInput(message) {
    // Check for suspicious patterns
    const suspiciousPatterns = [
        /hack|crack|keygen|bypass|exploit/i,
        /password|pin|secret key/i,
        /malware|virus|trojan/i
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(message)) {
            return {
                valid: false,
                reason: 'Message contains potentially harmful keywords'
            };
        }
    }
    
    return { valid: true };
}

/**
 * Format response according to Smart Tech Hub guidelines
 */
function formatResponse(aiResponse) {
    // Ensure links use correct format
    aiResponse = aiResponse.replace(
        /href=['"]?(?!https?|\/)(.*?)['"]?>/g,
        'href="$1">'
    );
    
    // Add class to links for styling
    aiResponse = aiResponse.replace(
        /<a href=/g,
        '<a class="link-style" href='
    );
    
    return aiResponse;
}

// Export for use in frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAIResponse,
        loadSystemPrompt,
        validateUserInput,
        formatResponse,
        getFallbackResponse
    };
}