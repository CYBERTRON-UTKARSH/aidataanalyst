# AI Product Revenue Analyst

## Project Description
**AI Product Revenue Analyst** is a full-stack product analytics web application that turns raw product sales files (`.csv`, `.xlsx`/`.xls`, `.json`) into actionable revenue insights, charts, and short-term forecasts. Built with a **FastAPI** backend and a **React + Vite** moonlight glassmorphism frontend, it focuses specifically on product performance—highlighting what is driving revenue growth alongside early warning signs of product decline or return issues—while fitting comfortably inside lightweight free-tier cloud limits.

## What It Gives You
1. **Cleaned Dataset Summary:** Automatically normalizes columns, strips currency symbols, parses dates/numbers, removes empty rows and duplicates, and reports how many rows were cleaned.
2. **Executive KPI Tiles:** Displays high-level product metrics at a glance, including Total Product Revenue, Unique Products, Top Revenue Driver (with share percentage), and Red Alert SKU count.
3. **Progress vs. Red Alert Insights:**
   - **Progress:** Identifies top revenue-generating products, fast-growing SKUs, and revenue momentum winners with recommended growth actions.
   - **Red Alert:** Flags sharp period-over-period revenue drops, slow/bottom-performing products, and high-return SKUs with concrete mitigation steps.
4. **Matplotlib & Seaborn Visuals:** Generates headless charts for both Progress and Red Alert insights and embeds them inside the main Power BI-style board.
5. **Separate ML Regression Block:** Fits a lightweight `Ridge` time-trend regression model on daily revenue (when enough timestamped rows exist) to project a 7-day revenue outlook, daily trend slope, and $R^2$ score in a dedicated lower panel.

## How It Works & Processing Flow
1. **File Upload & Format Conversion (`backend/pipeline.py`):** A user uploads a `.csv`, `.xlsx`/`.xls`, or `.json` file from the React frontend. The backend enforces file-size and row guardrails, loads the file into a Pandas `DataFrame`, and auto-detects product, revenue, quantity, date, and return columns.
2. **Data Cleaning (`backend/pipeline.py`):** Drops fully empty rows and duplicate records, trims whitespace from column names, strips currency symbols (`$`, `₹`, `€`, `£`) and commas from numeric strings, converts date fields with `pd.to_datetime(..., errors="coerce")`, and coerces revenue/quantity values safely.
3. **Deterministic Product Analytics (`backend/pipeline.py`):** Aggregates revenue and quantity by product, ranks top and bottom SKUs, compares first-half vs. second-half period revenue (when dates are present) to detect growing or declining products, and calculates return rates when return/refund columns exist.
4. **Visual Generation (`backend/charts.py`):** Configures Matplotlib with the non-interactive `Agg` backend, builds Seaborn/Matplotlib bar charts for Progress and Red Alert metrics, encodes figures as base64 PNGs, and closes each figure (`plt.close(fig)`) immediately to prevent memory leaks.
5. **LLM Insight Synthesis (`backend/llm_analyst.py`):** Sends only the compact aggregated metrics (not raw rows) to **Groq** (`openai/gpt-oss-120b`) with JSON mode to produce structured **Progress** and **Red Alert** cards (`title`, `metric_highlight`, `explanation`, `action`).
6. **Regression Forecasting (`backend/pipeline.py`):** Resamples dated revenue at a daily (`D`) frequency and fits a `Ridge` regression model over day indices to generate 7-day forward revenue predictions and trend slope.
7. **Frontend Rendering (`frontend/src/App.jsx`):** Renders the moonlight glass interface with a top KPI + Progress/Red Alert + chart board and a separate lower ML regression block.

## Step-by-Step Guide to Build & Run

### Step 1: Set Up the Project Folder Structure
Create the project directory with `backend/` and `frontend/` folders, plus `.gitignore` and `README.md` at the root:
```text
product-ai-analyst/
├── .gitignore
├── README.md
├── backend/
│   ├── main.py
│   ├── pipeline.py
│   ├── charts.py
│   ├── llm_analyst.py
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.jsx
        