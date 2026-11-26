import io
import re
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score


def load_and_convert(file_bytes: bytes, filename: str) -> pd.DataFrame:
    name = filename.lower()
    if name.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_bytes))
    elif name.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(file_bytes))
    elif name.endswith(".json"):
        return pd.read_json(io.BytesIO(file_bytes))
    raise ValueError("Unsupported file format. Upload CSV, XLSX, or JSON.")


def detect_columns(df: pd.DataFrame) -> dict:
    cols = {c.lower().strip(): c for c in df.columns}

    def match(patterns):
        for pat in patterns:
            for low, orig in cols.items():
                if re.search(pat, low):
                    return orig
        return None

    return {
        "product": match([r"product", r"item", r"sku", r"title", r"name"]),
        "revenue": match([r"revenue", r"sales", r"amount", r"total", r"price"]),
        "quantity": match([r"qty", r"quantity", r"units", r"sold", r"count"]),
        "date": match([r"date", r"time", r"created", r"order_date"]),
        "returns": match([r"return", r"refund", r"cancel"]),
        "rating": match([r"rating", r"review", r"score"]),
    }


def clean_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    initial_rows = len(df)
    df = df.dropna(how="all").drop_duplicates().copy()
    df.columns = [str(c).strip() for c in df.columns]

    # Clean currency/numeric strings like "$1,250.50"
    for col in df.select_dtypes(include=["object"]).columns:
        sample = df[col].dropna().astype(str).head(20)
        if sample.str.match(r"^[\$₹€£]?\s?-?\d[\d,]*(\.\d+)?$").mean() > 0.6:
            df[col] = (
                df[col]
                .astype(str)
                .str.replace(r"[\$₹€£,\s]", "", regex=True)
            )
            df[col] = pd.to_numeric(df[col], errors="coerce")

    col_map = detect_columns(df)

    if col_map["date"]:
        df[col_map["date"]] = pd.to_datetime(df[col_map["date"]], errors="coerce")

    if col_map["revenue"]:
        df[col_map["revenue"]] = pd.to_numeric(df[col_map["revenue"]], errors="coerce").fillna(0)

    if col_map["quantity"]:
        df[col_map["quantity"]] = pd.to_numeric(df[col_map["quantity"]], errors="coerce").fillna(1)

    report = {
        "initial_rows": initial_rows,
        "cleaned_rows": len(df),
        "duplicates_removed": initial_rows - len(df),
        "detected_columns": col_map,
    }
    return df, report


def compute_product_metrics(df: pd.DataFrame, col_map: dict) -> dict:
    prod_col = col_map["product"]
    rev_col = col_map["revenue"]
    qty_col = col_map["quantity"]
    date_col = col_map["date"]
    ret_col = col_map["returns"]

    if not prod_col or not rev_col:
        raise ValueError("Dataset must contain at least a Product/Item column and a Revenue/Price column.")

    agg_dict = {rev_col: "sum"}
    if qty_col:
        agg_dict[qty_col] = "sum"

    prod_summary = df.groupby(prod_col, as_index=False).agg(agg_dict)
    prod_summary = prod_summary.sort_values(by=rev_col, ascending=False)

    total_revenue = float(prod_summary[rev_col].sum())
    top_products = prod_summary.head(7).to_dict(orient="records")
    bottom_products = prod_summary.tail(5).sort_values(by=rev_col, ascending=True).to_dict(orient="records")

    # Trend / Momentum check if date column exists
    declining_products = []
    growing_products = []
    if date_col and df[date_col].notna().sum() > 5:
        valid_dates = df.dropna(subset=[date_col]).copy()
        midpoint = valid_dates[date_col].min() + (valid_dates[date_col].max() - valid_dates[date_col].min()) / 2
        first_half = valid_dates[valid_dates[date_col] <= midpoint].groupby(prod_col)[rev_col].sum()
        second_half = valid_dates[valid_dates[date_col] > midpoint].groupby(prod_col)[rev_col].sum()
        comp = pd.DataFrame({"prev": first_half, "curr": second_half}).fillna(0)
        comp["change_pct"] = np.where(comp["prev"] > 0, ((comp["curr"] - comp["prev"]) / comp["prev"]) * 100, 100.0)
        declining_products = (
            comp[comp["change_pct"] < -15]
            .sort_values("change_pct")
            .head(5)
            .reset_index()
            .to_dict(orient="records")
        )
        growing_products = (
            comp[comp["change_pct"] > 15]
            .sort_values("change_pct", ascending=False)
            .head(5)
            .reset_index()
            .to_dict(orient="records")
        )

    # High return / refund red alert check
    high_return_products = []
    if ret_col:
        df["_ret_flag"] = pd.to_numeric(df[ret_col], errors="coerce").fillna(0)
        ret_summary = df.groupby(prod_col).agg(orders=(rev_col, "count"), returns=("_ret_flag", "sum"))
        ret_summary["return_rate_pct"] = (ret_summary["returns"] / ret_summary["orders"]) * 100
        high_return_products = (
            ret_summary[ret_summary["return_rate_pct"] > 10]
            .sort_values("return_rate_pct", ascending=False)
            .head(5)
            .reset_index()
            .to_dict(orient="records")
        )

    top_product_name = str(top_products[0][prod_col]) if top_products else "N/A"
    top_product_share = round((top_products[0][rev_col] / total_revenue) * 100, 1) if total_revenue > 0 and top_products else 0.0

    return {
        "kpis": {
            "total_revenue": round(total_revenue, 2),
            "unique_products": int(df[prod_col].nunique()),
            "top_product": top_product_name,
            "top_product_share_pct": top_product_share,
            "at_risk_products_count": len(declining_products) + len(high_return_products),
        },
        "top_products": top_products,
        "bottom_products": bottom_products,
        "growing_products": growing_products,
        "declining_products": declining_products,
        "high_return_products": high_return_products,
        "prod_col": prod_col,
        "rev_col": rev_col,
        "date_col": date_col,
    }


def run_product_regression(df: pd.DataFrame, col_map: dict) -> dict:
    rev_col = col_map["revenue"]
    date_col = col_map["date"]

    if not date_col or df[date_col].notna().sum() < 6:
        return {
            "available": False,
            "reason": "Need at least 6 timestamped rows to train a revenue trend regression model.",
        }

    ts = (
        df.dropna(subset=[date_col])
        .set_index(date_col)[rev_col]
        .resample("D")
        .sum()
        .reset_index()
    )
    if len(ts) < 5:
        return {
            "available": False,
            "reason": "Insufficient distinct days for reliable time-series regression.",
        }

    ts["day_idx"] = np.arange(len(ts))
    X = ts[["day_idx"]].values
    y = ts[rev_col].values

    model = Ridge(alpha=1.0)
    model.fit(X, y)
    r2 = float(r2_score(y, model.predict(X)))

    future_days = np.arange(len(ts), len(ts) + 7).reshape(-1, 1)
    preds = np.maximum(model.predict(future_days), 0)

    return {
        "available": True,
        "model": "Ridge Time-Trend Regression",
        "daily_slope": round(float(model.coef_[0]), 2),
        "r2_score": round(r2, 3),
        "next_7_days_projected_revenue": round(float(preds.sum()), 2),
        "forecast_points": [
            {"day_ahead": i + 1, "predicted_revenue": round(float(val), 2)}
            for i, val in enumerate(preds)
        ],
    }