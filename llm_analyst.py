import json
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def generate_product_insights(metrics: dict) -> dict:
    payload = {
        "kpis": metrics["kpis"],
        "top_products": metrics["top_products"],
        "growing_products": metrics["growing_products"],
        "declining_products": metrics["declining_products"],
        "high_return_products": metrics["high_return_products"],
        "bottom_products": metrics["bottom_products"],
    }

    prompt = f"""
You are a senior e-commerce & SaaS Product Revenue Analyst.
Analyze the verified product metrics below and return strictly valid JSON with two keys:
1. "progress": array of 2-3 high-impact revenue-gaining insights (top products, surging demand, high-margin winners) with actionable next steps.
2. "red_alert": array of 2-3 urgent revenue-loss risks (declining SKUs, high return rates, over-reliance on 1 product, dead stock) with concrete mitigation actions.

Each item in both arrays MUST follow this exact schema:
{{
  "title": "Short punchy headline",
  "metric_highlight": "Exact number or % from the data",
  "explanation": "Why this impacts company revenue",
  "action": "Specific action for the product/growth team"
}}

Verified Data:
{json.dumps(payload, default=str)}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=900,
    )
    return json.loads(response.choices[0].message.content)