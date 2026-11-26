from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pipeline import clean_dataset, compute_product_metrics, load_and_convert, run_product_regression
from charts import generate_product_charts
from llm_analyst import generate_product_insights

app = FastAPI(title="AI Product Analyst API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Vercel/Render frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_BYTES = 5 * 1024 * 1024  # 5 MB guardrail for Render 512 MB RAM


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_product_file(file: UploadFile = File(...)):
    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

    try:
        df = load_and_convert(raw, file.filename)
        if len(df) > 25000:
            df = df.head(25000)

        cleaned_df, clean_report = clean_dataset(df)
        metrics = compute_product_metrics(cleaned_df, clean_report["detected_columns"])
        charts = generate_product_charts(metrics)
        insights = generate_product_insights(metrics)
        regression = run_product_regression(cleaned_df, clean_report["detected_columns"])

        return {
            "cleaning_report": clean_report,
            "kpis": metrics["kpis"],
            "insights": insights,
            "charts": charts,
            "regression": regression,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")