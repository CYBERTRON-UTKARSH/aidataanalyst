import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Upload failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const glassSurface = {
    background: "rgba(15, 23, 42, 0.58)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(186, 230, 253, 0.22)",
    boxShadow:
      "0 12px 40px rgba(2, 6, 23, 0.65), inset 0 1px 0 rgba(224, 242, 254, 0.16)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 20px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
        background:
          "radial-gradient(circle at 15% 10%, rgba(125, 211, 252, 0.16), transparent 40%), radial-gradient(circle at 85% 20%, rgba(165, 180, 252, 0.14), transparent 42%), linear-gradient(160deg, #050816 0%, #0b132b 52%, #060a18 100%)",
      }}
    >
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        {/* HEADER & FILE UPLOAD BAR */}
        <header
          style={{
            ...glassSurface,
            borderRadius: 16,
            padding: "18px 22px",
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#bae6fd",
                  boxShadow: "0 0 12px #7dd3fc, 0 0 24px #38bdf8",
                  display: "inline-block",
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: "#f8fafc",
                  textShadow: "0 0 18px rgba(186, 230, 253, 0.35)",
                }}
              >
                AI Product Revenue Analyst
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 20px", fontSize: 13, color: "#94a3b8" }}>
              {fileName
                ? `Active dataset: ${fileName}`
                : "Upload CSV, XLSX, or JSON product data for moonlight KPI & risk telemetry"}
            </p>
          </div>

          <label
            style={{
              cursor: "pointer",
              padding: "10px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "#e0f2fe",
              background: "rgba(56, 189, 248, 0.14)",
              border: "1px solid rgba(125, 211, 252, 0.38)",
              boxShadow: "0 0 16px rgba(125, 211, 252, 0.16)",
            }}
          >
            Choose Product File
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </header>

        {loading && (
          <div
            style={{
              ...glassSurface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: "#bae6fd",
              fontSize: 14,
            }}
          >
            Cleaning dataset, computing product KPIs, rendering charts, and running regression...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              marginBottom: 20,
              background: "rgba(127, 29, 29, 0.45)",
              border: "1px solid rgba(248, 113, 113, 0.45)",
              color: "#fecaca",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {data && (
          <>
            {/* BLOCK 1: POWER BI-STYLE MAIN RECTANGULAR GLASS BOARD */}
            <section
              style={{
                ...glassSurface,
                borderRadius: 18,
                padding: 24,
                marginBottom: 26,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  borderBottom: "1px solid rgba(186, 230, 253, 0.15)",
                  paddingBottom: 14,
                  marginBottom: 20,
                }}
              >
                <strong
                  style={{
                    fontSize: 15,
                    letterSpacing: 1.1,
                    color: "#e0f2fe",
                    textShadow: "0 0 14px rgba(125, 211, 252, 0.28)",
                  }}
                >
                  EXECUTIVE PRODUCT KPI & INSIGHT BOARD
                </strong>
                <span
                  style={{
                    fontSize: 12,
                    color: "#cbd5e1",
                    background: "rgba(30, 41, 59, 0.65)",
                    border: "1px solid rgba(148, 163, 184, 0.22)",
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  Cleaned {data.cleaning_report.cleaned_rows} rows (
                  {data.cleaning_report.duplicates_removed} duplicates removed)
                </span>
              </div>

              {/* TOP KPI ROW */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KpiCard
                  label="TOTAL PRODUCT REVENUE"
                  value={`$${data.kpis.total_revenue.toLocaleString()}`}
                  accent="#7dd3fc"
                />
                <KpiCard
                  label="UNIQUE PRODUCTS"
                  value={data.kpis.unique_products}
                  accent="#a5b4fc"
                />
                <KpiCard
                  label="TOP REVENUE DRIVER"
                  value={`${data.kpis.top_product} (${data.kpis.top_product_share_pct}%)`}
                  accent="#5eead4"
                />
                <KpiCard
                  label="RED ALERT SKUs"
                  value={data.kpis.at_risk_products_count}
                  accent="#fda4af"
                  alert
                />
              </div>

              {/* SPLIT PROGRESS VS RED ALERT + MATPLOTLIB/SEABORN VISUALS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                  gap: 20,
                }}
              >
                {/* PROGRESS COLUMN */}
                <div
                  style={{
                    background: "rgba(13, 148, 136, 0.08)",
                    border: "1px solid rgba(94, 234, 212, 0.24)",
                    boxShadow: "inset 0 0 24px rgba(45, 212, 191, 0.06)",
                    borderRadius: 14,
                    padding: 18,
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: 14,
                      fontSize: 14,
                      letterSpacing: 0.8,
                      color: "#99f6e4",
                      textShadow: "0 0 12px rgba(94, 234, 212, 0.3)",
                    }}
                  >
                    PROGRESS — REVENUE GAINS
                  </h3>

                  {data.charts.progress_chart && (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.92)",
                        borderRadius: 10,
                        padding: 8,
                        marginBottom: 14,
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <img
                        src={data.charts.progress_chart}
                        alt="Progress Chart"
                        style={{ width: "100%", display: "block", borderRadius: 6 }}
                      />
                    </div>
                  )}

                  {data.insights.progress?.map((item, idx) => (
                    <InsightCard
                      key={idx}
                      item={item}
                      glowColor="rgba(94, 234, 212, 0.35)"
                      accent="#5eead4"
                      badgeBg="rgba(20, 184, 166, 0.18)"
                      badgeColor="#99f6e4"
                    />
                  ))}
                </div>

                {/* RED ALERT COLUMN */}
                <div
                  style={{
                    background: "rgba(190, 18, 60, 0.09)",
                    border: "1px solid rgba(251, 113, 133, 0.28)",
                    boxShadow: "inset 0 0 24px rgba(244, 63, 94, 0.07)",
                    borderRadius: 14,
                    padding: 18,
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: 14,
                      fontSize: 14,
                      letterSpacing: 0.8,
                      color: "#fecdd3",
                      textShadow: "0 0 12px rgba(251, 113, 133, 0.35)",
                    }}
                  >
                    RED ALERT — DOWNFALL RISKS
                  </h3>

                  {data.charts.alert_chart && (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.92)",
                        borderRadius: 10,
                        padding: 8,
                        marginBottom: 14,
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <img
                        src={data.charts.alert_chart}
                        alt="Red Alert Chart"
                        style={{ width: "100%", display: "block", borderRadius: 6 }}
                      />
                    </div>
                  )}

                  {data.insights.red_alert?.map((item, idx) => (
                    <InsightCard
                      key={idx}
                      item={item}
                      glowColor="rgba(251, 113, 133, 0.35)"
                      accent="#fb7185"
                      badgeBg="rgba(225, 29, 72, 0.2)"
                      badgeColor="#fecdd3"
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* BLOCK 2: SEPARATE LOWER RECTANGULAR ML REGRESSION GLASS BLOCK */}
            <section
              style={{
                ...glassSurface,
                borderRadius: 18,
                padding: 22,
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.72), rgba(30, 27, 75, 0.52))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <strong
                  style={{
                    fontSize: 14,
                    letterSpacing: 1,
                    color: "#e0e7ff",
                    textShadow: "0 0 14px rgba(165, 180, 252, 0.35)",
                  }}
                >
                  ML REVENUE REGRESSION & PREDICTIONS
                </strong>
                {data.regression.available && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#c7d2fe",
                      background: "rgba(79, 70, 229, 0.22)",
                      border: "1px solid rgba(165, 180, 252, 0.3)",
                      padding: "4px 12px",
                      borderRadius: 999,
                    }}
                  >
                    {data.regression.model} | R²: {data.regression.r2_score}
                  </span>
                )}
              </div>

              {data.regression.available ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.65)",
                      border: "1px solid rgba(165, 180, 252, 0.25)",
                      padding: 18,
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, letterSpacing: 0.7, color: "#94a3b8" }}>
                      7-DAY PROJECTED REVENUE
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#a5f3fc",
                        textShadow: "0 0 16px rgba(103, 232, 249, 0.35)",
                        margin: "6px 0",
                      }}
                    >
                      ${data.regression.next_7_days_projected_revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                      Daily Trend Slope:{" "}
                      <strong style={{ color: data.regression.daily_slope >= 0 ? "#6ee7b7" : "#fda4af" }}>
                        {data.regression.daily_slope >= 0 ? "+" : ""}
                        {data.regression.daily_slope} / day
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(86px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {data.regression.forecast_points.map((pt) => (
                      <div
                        key={pt.day_ahead}
                        style={{
                          background: "rgba(15, 23, 42, 0.58)",
                          border: "1px solid rgba(186, 230, 253, 0.16)",
                          padding: 12,
                          borderRadius: 10,
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Day +{pt.day_ahead}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginTop: 4 }}>
                          ${pt.predicted_revenue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
                  {data.regression.reason}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent, alert = false }) {
  return (
    <div
      style={{
        background: alert ? "rgba(159, 18, 57, 0.16)" : "rgba(15, 23, 42, 0.52)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${alert ? "rgba(251, 113, 133, 0.34)" : "rgba(186, 230, 253, 0.2)"}`,
        borderTop: `3px solid ${accent}`,
        boxShadow: `0 8px 24px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
        padding: 16,
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#94a3b8" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginTop: 6,
          color: alert ? "#fecdd3" : "#f8fafc",
          textShadow: `0 0 14px ${accent}33`,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsightCard({ item, glowColor, accent, badgeBg, badgeColor }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.62)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(226, 232, 240, 0.14)",
        borderLeft: `3px solid ${accent}`,
        boxShadow: `0 6px 18px rgba(2, 6, 23, 0.4), 0 0 12px ${glowColor}1a`,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 14, color: "#f8fafc" }}>{item.title}</strong>
        <span
          style={{
            background: badgeBg,
            color: badgeColor,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            border: `1px solid ${accent}44`,
          }}
        >
          {item.metric_highlight}
        </span>
      </div>
      <p style={{ fontSize: 13, color: "#cbd5e1", margin: "8px 0", lineHeight: 1.45 }}>
        {item.explanation}
      </p>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#e0f2fe" }}>
        Action: {item.action}
      </div>
    </div>
  );
}