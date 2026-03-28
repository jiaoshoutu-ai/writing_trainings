/**
 * Writing Assistant - 写作评估工具
 * 基于 iflow API (deepseek-v3 模型)，提供上海初中语文名师级别的写作评估和建议
 */

const WritingAssistant = {
    // API 配置
    config: {
        baseURL: 'https://apis.iflow.cn/v1',
        model: 'deepseek-v3',
        apiKey: 'sk-31695a4872ae3911906b711ae68faec3' // 需要在使用前设置
    },

    // 初始化 - 设置 API key
    init(apiKey) {
        this.config.apiKey = apiKey;
    },

    /**
     * 调用 iflow API
     * @param {string} prompt - 提示词
     * @param {number} maxTokens - 最大 token 数
     * @returns {Promise<string>} API 响应内容
     */
    async callAPI(prompt, maxTokens = 500) {
        if (!this.config.apiKey) {
            throw new Error('请先调用 WritingAssistant.init(apiKey) 设置 API key');
        }

        try {
            const response = await fetch(`${this.config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位经验丰富的上海初中语文名师，擅长指导学生写作。你的点评专业、温和、鼓励性强，能用学生容易理解的语言指出问题并给出具体修改建议。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `API 请求失败：${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('WritingAssistant API 调用失败:', error);
            throw error;
        }
    },

    /**
     * 评估学生的句子或段落
     * @param {string} studentWriting - 学生写的句子或段落
     * @param {string} topic - 写作主题/题目（可选）
     * @returns {Promise<Object>} 评估结果
     */
    async evaluate(studentWriting, topic = '') {
        const prompt = topic
            ? `请评估下面这段学生习作，主题是"${topic}"：\n\n"${studentWriting}"\n\n请从以下角度进行点评：\n1. 优点（至少 1 点）\n2. 需要改进的地方（最多 2 点）\n3. 具体的修改建议（给出修改后的示例）`
            : `请评估下面这段学生习作：\n\n"${studentWriting}"\n\n请从以下角度进行点评：\n1. 优点（至少 1 点）\n2. 需要改进的地方（最多 2 点）\n3. 具体的修改建议（给出修改后的示例）`;

        const feedback = await this.callAPI(prompt, 600);
        return {
            original: studentWriting,
            topic: topic,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 针对"流水账"问题进行评估
     * @param {string} studentWriting - 学生写的句子或段落
     * @returns {Promise<Object>} 评估结果
     */
    async checkForRunningAccount(studentWriting) {
        const prompt = `请检查下面这段文字是否有"流水账"问题（即平铺直叙、缺少波澜）：\n\n"${studentWriting}"\n\n请：\n1. 指出是否有流水账问题\n2. 如果有，说明哪里平淡\n3. 给出修改建议，如何让情节更有波澜`;

        const feedback = await this.callAPI(prompt, 500);
        return {
            original: studentWriting,
            type: '流水账检查',
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 检查是否使用了空洞词（如"很好"、"非常美"等）
     * @param {string} studentWriting - 学生写的句子或段落
     * @returns {Promise<Object>} 评估结果
     */
    async checkForEmptyWords(studentWriting) {
        const prompt = `请检查下面这段文字中是否有空洞词（如"很好"、"非常美"、"特别开心"等抽象词汇）：\n\n"${studentWriting}"\n\n请：\n1. 找出所有空洞词\n2. 针对每个空洞词，给出具体的替换建议（用五感细节、动作、神态等具体描写来替换）`;

        const feedback = await this.callAPI(prompt, 500);
        return {
            original: studentWriting,
            type: '空洞词检查',
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 五感描写评估
     * @param {string} studentWriting - 学生写的句子或段落
     * @returns {Promise<Object>} 评估结果
     */
    async evaluateFiveSenses(studentWriting) {
        const prompt = `请分析下面这段文字是否激活了读者的五感（视觉、听觉、嗅觉、味觉、触觉）：\n\n"${studentWriting}"\n\n请：\n1. 指出已使用的感官描写\n2. 指出可以补充的感官细节\n3. 给出一个加入五感描写的修改示例`;

        const feedback = await this.callAPI(prompt, 500);
        return {
            original: studentWriting,
            type: '五感描写评估',
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 慢镜头描写评估（把瞬间写长）
     * @param {string} studentWriting - 学生写的句子或段落
     * @returns {Promise<Object>} 评估结果
     */
    async evaluateSlowMotion(studentWriting) {
        const prompt = `请评估下面这段文字是否成功运用了"慢镜头"技巧（把一个瞬间的动作拉长、分解，加入细节）：\n\n"${studentWriting}"\n\n请：\n1. 评价是否有慢镜头意识\n2. 指出可以进一步分解的动作\n3. 给出一个慢镜头修改示例`;

        const feedback = await this.callAPI(prompt, 500);
        return {
            original: studentWriting,
            type: '慢镜头评估',
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 通用写作建议
     * @param {string} studentWriting - 学生写的句子或段落
     * @param {string} lessonType - 课程类型（如'悬念'、'对话'、'细节'等）
     * @returns {Promise<Object>} 评估结果
     */
    async getWritingTips(studentWriting, lessonType = '通用') {
        const prompt = `学生正在学习"${lessonType}"写作技巧。请评估下面这段文字，并给出针对性的建议：\n\n"${studentWriting}"\n\n请用温和鼓励的语气，给出 1-2 条具体可操作的建议。`;

        const feedback = await this.callAPI(prompt, 400);
        return {
            original: studentWriting,
            lessonType: lessonType,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
    }
};

// 导出（支持模块和全局两种使用方式）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WritingAssistant;
}
if (typeof window !== 'undefined') {
    window.WritingAssistant = WritingAssistant;
}
