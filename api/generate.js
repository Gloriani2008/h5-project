// api/generate.js
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userProfile } = req.body;

  // 组装我们在上一步设计的 Prompt
  const prompt = `
你现在是一位有着 10 年行业经验的资深“AI 时代职业规划顾问”。你的说话风格犀利、一针见血、专业且富有洞察力。
请根据以下求职者的真实背景，为他生成一段 150-200 字左右的【专属深度诊断评语】。

【求职者画像】
- 学历阶段：${userProfile.stage}
- 核心专业：${userProfile.subMajor} (${userProfile.major})
- 偏好雇主：${userProfile.employer}
- 目标城市：${userProfile.city}
- 求职最看重：${userProfile.goal}
- 目前AI技能：${userProfile.aiLevel}
- 最大求职痛点：${userProfile.painPoint}
- 系统匹配的最优方向：${userProfile.matchedDirection}

【输出逻辑要求】
1. 破冰与痛点共鸣（约 40 字）：直接点破他目前的困局。
2. 价值重塑（约 60 字）：解释为什么他的背景在匹配赛道是极具优势的。
3. 制造信息差与行动呼吁（约 60 字）：结合他目前的AI技能，指出他距离拿到Offer还差一个关键的认知或简历包装。告诉他需要立刻找顾问做一对一深度拆解。

【语气要求】
绝不能有AI味，语气要克制、专业，带一点压迫感，分三个自然段。
`;

  try {
    // 调用 DeepSeek 的 API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 这里安全地读取 Vercel 环境变量中的 Key
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` 
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7 // 控制回答的创造性，0.7 比较平衡
      })
    });

    const data = await response.json();
    
    // 返回大模型的回答给前端
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ result: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'AI 生成失败' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
