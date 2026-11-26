import base64
import io
import matplotlib
matplotlib.use("Agg")  # Mandatory for headless servers like Render
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

sns.set_theme(style="whitegrid")


def _fig_to_base64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=130, bbox_inches="tight")
    plt.close(fig)  # Prevent RAM leak on Render
    buf.seek(0)
    return "data:image/png;base64," + base64.b64encode(buf.read()).decode("utf-8")


def generate_product_charts(metrics: dict) -> dict:
    prod_col = metrics["prod_col"]
    rev_col = metrics["rev_col"]
    charts = {}

    # 1. PROGRESS CHART: Top Revenue-Generating Products
    if metrics["top_products"]:
        top_df = pd.DataFrame(metrics["top_products"])
        fig, ax = plt.subplots(figsize=(6.5, 3.6))
        sns.barplot(
            data=top_df,
            x=rev_col,
            y=prod_col,
            hue=prod_col,
            palette="Greens_r",
            legend=False,
            ax=ax,
        )
        ax.set_title("Progress: Top Revenue-Generating Products", fontsize=11, fontweight="bold")
        ax.set_xlabel("Revenue")
        ax.set_ylabel("")
        charts["progress_chart"] = _fig_to_base64(fig)

    # 2. RED ALERT CHART: Declining Products or Lowest-Performing SKUs
    if metrics["declining_products"]:
        dec_df = pd.DataFrame(metrics["declining_products"])
        fig, ax = plt.subplots(figsize=(6.5, 3.6))
        sns.barplot(
            data=dec_df,
            x="change_pct",
            y=prod_col,
            hue=prod_col,
            palette="Reds_r",
            legend=False,
            ax=ax,
        )
        ax.set_title("Red Alert: Sharpest Revenue Drop (%)", fontsize=11, fontweight="bold", color="#b91c1c")
        ax.set_xlabel("Period-over-Period Change (%)")
        ax.set_ylabel("")
        charts["alert_chart"] = _fig_to_base64(fig)
    elif metrics["bottom_products"]:
        bot_df = pd.DataFrame(metrics["bottom_products"])
        fig, ax = plt.subplots(figsize=(6.5, 3.6))
        sns.barplot(
            data=bot_df,
            x=rev_col,
            y=prod_col,
            hue=prod_col,
            palette="Reds_r",
            legend=False,
            ax=ax,
        )
        ax.set_title("Red Alert: Lowest-Revenue / Slow-Moving Products", fontsize=11, fontweight="bold", color="#b91c1c")
        ax.set_xlabel("Revenue")
        ax.set_ylabel("")
        charts["alert_chart"] = _fig_to_base64(fig)

    return charts