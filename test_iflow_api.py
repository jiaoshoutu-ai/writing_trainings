#!/usr/bin/env python3
"""
验证 iflow API 的测试脚本
从环境变量 $iflow_key 读取 API key
"""

import os
from openai import OpenAI


def test_iflow_api():
    # 从环境变量读取 API key
    api_key = os.getenv("iflow_key")

    if not api_key:
        print("错误：未找到环境变量 'iflow_key'")
        print("请先设置：export iflow_key='your-api-key-here'")
        return False

    # 创建客户端
    client = OpenAI(
        base_url="https://apis.iflow.cn/v1",
        api_key=api_key,
    )

    # 使用指定的模型
    model = "deepseek-v3"

    print(f"正在调用 iflow API...")
    print(f"使用模型：{model}")

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": "你好，请用一句话介绍你自己"
                }
            ]
        )

        if completion.choices:
            response = completion.choices[0].message.content
            print(response)
            print(f"\n=== 调用成功 ===")

            if hasattr(completion, 'usage') and completion.usage:
                print(f"\nToken 使用:")
                print(f"  输入：{completion.usage.prompt_tokens}")
                print(f"  输出：{completion.usage.completion_tokens}")
                print(f"  总计：{completion.usage.total_tokens}")

            return True
        else:
            print(f"错误：API 返回的 choices 为空")
            return False

    except Exception as e:
        print(f"\n=== 调用失败 ===")
        print(f"错误类型：{type(e).__name__}")
        print(f"错误信息：{e}")
        return False


if __name__ == "__main__":
    success = test_iflow_api()
    exit(0 if success else 1)
