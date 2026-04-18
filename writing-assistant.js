/**
 * Writing Assistant - API 调用封装
 *
 * 使用示例：
 *   // 方法 1：直接使用 callAPI
 *   const result = await callAPI([
 *     { role: 'system', content: '你是写作助手' },
 *     { role: 'user', content: '你好' }
 *   ]);
 *
 *   // 方法 2：使用 chat 快捷方法
 *   const result = await chat('请帮我修改这段文字', '你是写作老师');
 *
 */

// 配置
const APIConfig = {
    providers: {
        deepseek: {
            baseURL: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat'
        }
    }
};

// 获取当前 API 配置
function getCurrentConfig() {
    const provider = 'deepseek';
    const storageKey = 'deepseek_api_key';
    let apiKey = localStorage.getItem(storageKey);

    return {
        provider,
        apiKey,
        baseURL: APIConfig.providers[provider].baseURL,
        model: APIConfig.providers[provider].model
    };
}

/**
 * 调用 API
 * @param {Array<{role: string, content: string}>} messages - 消息数组
 * @param {Object} options - 配置选项
 * @param {string} options.model - 模型名称
 * @param {number} options.max_tokens - 最大 token 数
 * @param {number} options.temperature - 温度 (0-2)
 * @returns {Promise<{content: string, usage: object}>}
 */
export async function callAPI(messages, options = {}) {
    const config = getCurrentConfig();

    if (!config.apiKey) {
        console.error('[API] Error: API Key is not configured');
        throw new Error('请先在「大模型配置」页面设置 API Key');
    }

    const {
        model = config.model,
        max_tokens,
        temperature = 0.7,
    } = options;

    const requestBody = {
        model,
        messages,
        temperature,
    };

    if (max_tokens !== undefined) {
        requestBody.max_tokens = max_tokens;
    }

    let response;
    try {
        response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });
    } catch (error) {
        console.error('[API] Network error:', error.message);
        throw error;
    }

    const data = await response.json();

    if (!response.ok) {
        console.error('[API] Error:', JSON.stringify(data, null, 2));
        throw new Error(`API error: ${response.status} ${data.error?.message || 'Unknown error'}`);
    }

    return {
        content: data.choices[0].message.content,
        usage: data.usage,
    };
}

/**
 * 简单聊天
 * @param {string} userMessage - 用户消息
 * @param {string} systemPrompt - 系统提示
 * @returns {Promise<string>}
 */
export async function chat(userMessage, systemPrompt = '你是经验丰富的上海初中语文名师，擅长指导学生写作和阅读作业。你的点评专业、温和、鼓励性强，能用学生容易理解的语言指出问题并给出具体修改建议.') {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];

    const result = await callAPI(messages);
    return result.content;
}

// 导出配置获取方法
export { getCurrentConfig };

// 浏览器环境：暴露到全局作用域
if (typeof window !== 'undefined') {
    window.chat = chat;
    window.callAPI = callAPI;
    window.getCurrentConfig = getCurrentConfig;
}
