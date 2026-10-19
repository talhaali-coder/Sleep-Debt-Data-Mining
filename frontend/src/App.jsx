
import { useEffect, useState } from "react";

import {
  getOverview,
  getModelComparison,
  getDatasetPreview,
  getHistogram,
  getBoxplot,
  getScatterplot,
  getCorrelation,
  getPredictionOptions,
  predictSleepDebt,
} from "./services/api";

import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  Database,
  FlaskConical,
  LayoutDashboard,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import "./index.css";

const COLORS = ["#e5484d", "#ff8585", "#a52b35", "#efb0b0"];

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Dataset Explorer", icon: Database },
  { name: "Visualizations", icon: ChartNoAxesCombined },
  { name: "Model Lab", icon: FlaskConical },
  { name: "Prediction", icon: Brain },
];

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <div className="metric-icon">
          <Icon size={19} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  );
}

function Dashboard({ overview, models, loading, error, refresh }) {
  const categoryData = Object.entries(
    overview?.category_distribution ?? {},
  ).map(([name, value]) => ({ name, value }));

  const modelData = models.map((model) => ({
    name: model.model ?? model.name ?? "Model",
    accuracy: Number(model.accuracy ?? 0) * 100,
    f1: Number(
      model.f1_macro ?? model.macro_f1 ?? model.f1_score ?? 0,
    ) * 100,
  }));

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> DATA INTELLIGENCE
          </div>
          <h1>Sleep Debt Dashboard</h1>
          <p>
            Explore sleep patterns, screen habits, and machine learning
            predictions.
          </p>
        </div>
        <button className="secondary-button" onClick={refresh}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading-banner">Loading dashboard data...</div>}

      <div className="metrics-grid">
        <MetricCard
          title="Total Records"
          value={(overview?.rows ?? 0).toLocaleString()}
          subtitle="Dataset observations"
          icon={Database}
        />
        <MetricCard
          title="Dataset Features"
          value={overview?.features ?? "—"}
          subtitle="Available input variables"
          icon={Activity}
        />
        <MetricCard
          title="Best Model Accuracy"
          value={models.length
            ? `${(Math.max(...models.map((m) =>
                Number(m.accuracy ?? 0),
              )) * 100).toFixed(2)}%`
            : "—"}
          subtitle="Highest test accuracy"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Models Evaluated"
          value={models.length || "—"}
          subtitle="Classification algorithms"
          icon={Brain}
        />
      </div>

      <div className="charts-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Sleep Debt Distribution</h2>
              <p>Number of records in each target category</p>
            </div>
            <span className="panel-tag">DATASET</span>
          </div>
          {categoryData.length ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#201719",
                      border: "1px solid #503035",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              Category data will appear when the backend returns it.
            </div>
          )}
          <div className="category-legend">
            {categoryData.map((item, index) => (
              <div className="legend-item" key={item.name}>
                <span
                  className="legend-dot"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
                <strong>{item.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Model Performance</h2>
              <p>Accuracy across evaluated classifiers</p>
            </div>
            <span className="panel-tag">ML MODELS</span>
          </div>
          {modelData.length ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelData}
                  margin={{ top: 15, right: 8, left: -18, bottom: 35 }}
                >
                  <CartesianGrid stroke="#39282b" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#bcaeb0", fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#bcaeb0", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(2)}%`}
                    contentStyle={{
                      background: "#201719",
                      border: "1px solid #503035",
                      borderRadius: 10,
                    }}
                  />
                  <Bar
                    dataKey="accuracy"
                    name="Accuracy"
                    fill="#e5484d"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              Model results will appear when the backend returns them.
            </div>
          )}
          <p className="chart-note">
            Performance is based on the saved evaluation results.
          </p>
        </section>
      </div>

      <section className="panel model-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Model Comparison</h2>
            <p>Compare classification accuracy and macro F1 score.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Macro F1</th>
              </tr>
            </thead>
            <tbody>
              {modelData.map((model) => (
                <tr key={model.name}>
                  <td>{model.name}</td>
                  <td>{model.accuracy.toFixed(2)}%</td>
                  <td>{model.f1.toFixed(2)}%</td>
                </tr>
              ))}
              {!modelData.length && (
                <tr>
                  <td colSpan="3">No model comparison data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function DatasetExplorer() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDatasetPreview(100)
      .then((response) => setData(response.data))
      .catch((err) => {
        console.error(err);
        setError("Unable to load dataset. Check the backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  const records = (data?.records ?? []).filter((record) =>
    Object.values(record).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase()),
    ),
  );

  if (loading) return <div className="panel">Loading dataset...</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return null;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DATA EXPLORATION</div>
          <h1>Dataset Explorer</h1>
          <p>Search and inspect the sleep-debt dataset.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Total Records"
          value={data.rows.toLocaleString()}
          subtitle="Dataset rows"
          icon={Database}
        />
        <MetricCard
          title="Columns"
          value={data.column_count}
          subtitle="Available variables"
          icon={Activity}
        />
        <MetricCard
          title="Missing Values"
          value={data.missing_values}
          subtitle="Across the dataset"
          icon={Search}
        />
        <MetricCard
          title="Preview Records"
          value={data.preview_count}
          subtitle="Rows currently loaded"
          icon={LayoutDashboard}
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Dataset Records</h2>
            <p>Showing up to 100 records from your CSV file.</p>
          </div>
        </div>

        <input
          className="dataset-search"
          type="search"
          placeholder="Search rows, categories, or values..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="table-scroll dataset-table">
          <table>
            <thead>
              <tr>
                {data.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  {data.columns.map((column) => (
                    <td key={column}>
                      {String(record[column] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan={data.columns.length}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="chart-note">
          {records.length} matching records in the loaded preview.
          Use the search field to filter the table.
        </p>
      </section>
    </>
  );
}



function Visualizations() {
  const [column, setColumn] = useState("total_sleep_hours");
  const [xColumn, setXColumn] = useState("total_sleep_hours");
  const [yColumn, setYColumn] = useState("bedtime_phone_minutes");

  const [histogram, setHistogram] = useState(null);
  const [boxplot, setBoxplot] = useState(null);
  const [scatterplot, setScatterplot] = useState(null);
  const [correlation, setCorrelation] = useState(null);

  const [histogramLoading, setHistogramLoading] = useState(true);
  const [otherLoading, setOtherLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = [
    "total_sleep_hours",
    "bedtime_phone_minutes",
    "screen_brightness_pct",
    "sleep_latency_min",
    "physical_activity_min",
    "deep_sleep_pct",
    "rem_sleep_pct",
    "age",
  ];

  const chartColor = "#e5484d";
  const gridColor = "#39282b";
  const textColor = "#bcaeb0";

  useEffect(() => {
    let active = true;

    setHistogramLoading(true);

    getHistogram(column)
      .then((response) => {
        if (active) {
          setHistogram(response.data);
        }
      })
      .catch((err) => {
        console.error("Histogram error:", err);
        if (active) {
          setError("Unable to load histogram. Check the backend API.");
        }
      })
      .finally(() => {
        if (active) {
          setHistogramLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [column]);

  useEffect(() => {
    let active = true;

    setOtherLoading(true);

    Promise.all([
      getBoxplot(column),
      getScatterplot(xColumn, yColumn),
      getCorrelation(),
    ])
      .then(([box, scatter, corr]) => {
        if (active) {
          setBoxplot(box.data);
          setScatterplot(scatter.data);
          setCorrelation(corr.data);
        }
      })
      .catch((err) => {
        console.error("Visualization error:", err);
        if (active) {
          setError("Unable to load some visualizations. Check the backend API.");
        }
      })
      .finally(() => {
        if (active) {
          setOtherLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [column, xColumn, yColumn]);

  const histogramData = Array.isArray(histogram?.labels)
    ? histogram.labels.map((label, index) => ({
        bin: label,
        count: histogram.values?.[index] ?? 0,
      }))
    : [];

  const scatterData = Array.isArray(scatterplot?.points)
    ? scatterplot.points
    : [];

  const correlationColumns = correlation?.columns ?? [];
  const correlationMatrix = correlation?.matrix ?? [];

  function correlationColor(value) {
    if (value === null || value === undefined) {
      return "rgba(188, 174, 176, 0.12)";
    }

    const strength = Math.min(Math.abs(value), 1);
    const opacity = 0.15 + strength * 0.75;

    return value >= 0
      ? `rgba(22, 163, 74, ${opacity})`
      : `rgba(229, 72, 77, ${opacity})`;
  }

  const axisProps = {
    tick: { fill: textColor, fontSize: 11 },
    axisLine: { stroke: gridColor },
    tickLine: { stroke: gridColor },
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>Data Visualizations</h2>
          <p>
            Explore distributions, outliers, relationships, and correlations.
          </p>
        </div>
      </div>

      {error && (
        <p style={{ color: chartColor, marginBottom: 16 }}>{error}</p>
      )}

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Histogram</h3>
          <p>Distribution of values in the selected numerical column.</p>

          <label>Numerical column</label>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
          >
            {columns.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div style={{ width: "100%", height: 300, marginTop: 20 }}>
            {histogramLoading ? (
              <p>Loading histogram...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={histogramData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke={gridColor}
                    strokeDasharray="3 3"
                  />
                  <XAxis dataKey="bin" hide />
                  <YAxis {...axisProps} />
                  <Tooltip
                    contentStyle={{
                      background: "#201719",
                      border: "1px solid #503035",
                      borderRadius: 12,
                      color: "#ffffff",
                    }}
                    cursor={{ fill: "rgba(229, 72, 77, 0.08)" }}
                  />
                  
<Bar
  dataKey="count"
  name="Count"
  fill={chartColor}
  radius={[7, 7, 0, 0]}
  isAnimationActive={true}
  animationDuration={700}
  animationEasing="ease-out"
/>

                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {histogram && !histogramLoading && (
            <p style={{ marginTop: 12 }}>
              Mean: {Number(histogram.mean).toFixed(2)} | Median:{" "}
              {Number(histogram.median).toFixed(2)} | Std. Dev.:{" "}
              {Number(histogram.std).toFixed(2)}
            </p>
          )}
        </section>

        <section className="panel">
          <h3>Boxplot</h3>
          <p>Understand spread and potential outliers.</p>

          {otherLoading ? (
            <p>Loading boxplot...</p>
          ) : boxplot ? (
            <>
              <strong>{boxplot.column}</strong>

              <div
                style={{
                  width: "100%",
                  height: 150,
                  position: "relative",
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "5%",
                    right: "5%",
                    top: 72,
                    height: 3,
                    background: "#805257",
                    borderRadius: 10,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "5%",
                    top: 57,
                    width: 3,
                    height: 33,
                    background: chartColor,
                    borderRadius: 4,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "5%",
                    top: 57,
                    width: 3,
                    height: 33,
                    background: chartColor,
                    borderRadius: 4,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "25%",
                    width: "50%",
                    top: 43,
                    height: 60,
                    boxSizing: "border-box",
                    border: `2px solid ${chartColor}`,
                    background: "rgba(229, 72, 77, 0.18)",
                    borderRadius: 12,
                    transition: "all 0.3s ease",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 43,
                    height: 60,
                    width: 4,
                    background: chartColor,
                    borderRadius: 4,
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 6,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {[
                  ["Min", boxplot.min],
                  ["Q1", boxplot.q1],
                  ["Median", boxplot.median],
                  ["Q3", boxplot.q3],
                  ["Max", boxplot.max],
                ].map(([label, value]) => (
                  <div key={label}>
                    <strong>{label}</strong>
                    <div>{Number(value).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <p style={{ marginTop: 16 }}>
                Potential outliers:{" "}
                <strong>{boxplot.outlier_count}</strong>
              </p>
              <p>
                Lower fence: {Number(boxplot.lower_fence).toFixed(2)} | Upper
                fence: {Number(boxplot.upper_fence).toFixed(2)}
              </p>
            </>
          ) : (
            <p>No boxplot data available.</p>
          )}
        </section>

        <section className="panel">
          <h3>Scatterplot</h3>
          <p>Explore the relationship between two numerical variables.</p>

          <label>X-axis</label>
          <select
            value={xColumn}
            onChange={(e) => setXColumn(e.target.value)}
          >
            {columns.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label style={{ display: "block", marginTop: 12 }}>
            Y-axis
          </label>
          <select
            value={yColumn}
            onChange={(e) => setYColumn(e.target.value)}
          >
            {columns.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div style={{ width: "100%", height: 300, marginTop: 20 }}>
            {otherLoading ? (
              <p>Loading scatterplot...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid
                    stroke={gridColor}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    {...axisProps}
                    type="number"
                    dataKey="x"
                    name={xColumn}
                    label={{
                      value: xColumn,
                      position: "insideBottom",
                      offset: -5,
                      fill: textColor,
                    }}
                  />
                  <YAxis
                    {...axisProps}
                    type="number"
                    dataKey="y"
                    name={yColumn}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#201719",
                      border: "1px solid #503035",
                      borderRadius: 12,
                      color: "#ffffff",
                    }}
                    cursor={{ stroke: chartColor, strokeDasharray: "3 3" }}
                  />
                  <Scatter
                    data={scatterData}
                    fill={chartColor}
                    animationDuration={450}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>

          <p>Showing {scatterData.length} sampled data points.</p>
        </section>

        <section className="panel">
          <h3>Correlation Heatmap</h3>
          <p>
            Green indicates positive correlation; red indicates negative
            correlation. Stronger colors indicate stronger relationships.
          </p>

          {otherLoading ? (
            <p>Loading correlation heatmap...</p>
          ) : correlationColumns.length > 0 ? (
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table
                style={{
                  borderCollapse: "separate",
                  borderSpacing: 3,
                  fontSize: 11,
                  minWidth: "100%",
                }}
              >
                <thead>
                  <tr>
                    <th />
                    {correlationColumns.map((name) => (
                      <th
                        key={name}
                        title={name}
                        style={{
                          padding: 4,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          height: 120,
                          maxWidth: 30,
                          overflow: "hidden",
                          color: textColor,
                        }}
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {correlationColumns.map((name, rowIndex) => (
                    <tr key={name}>
                      <th
                        style={{
                          textAlign: "right",
                          padding: 5,
                          whiteSpace: "nowrap",
                          color: textColor,
                        }}
                      >
                        {name}
                      </th>

                      {correlationColumns.map((otherName, columnIndex) => {
                        const value =
                          correlationMatrix[rowIndex]?.[columnIndex] ?? 0;

                        return (
                          <td
                            key={otherName}
                            title={`${name} vs ${otherName}: ${Number(value).toFixed(2)}`}
                            style={{
                              background: correlationColor(value),
                              color: "#ffffff",
                              textAlign: "center",
                              minWidth: 36,
                              height: 34,
                              borderRadius: 7,
                              padding: 4,
                              transition: "background 0.25s ease",
                            }}
                          >
                            {Number(value).toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No correlation data available.</p>
          )}
        </section>
      </div>
    </div>
  );
}




function ModelLab({ models }) {
  const modelData = Array.isArray(models)
    ? models
    : models?.models ?? models?.results ?? models?.comparison ?? [];

  const bestModel = modelData.length
    ? [...modelData].sort(
        (a, b) =>
          Number(b.macro_f1 ?? b.f1_score ?? b.f1 ?? 0) -
          Number(a.macro_f1 ?? a.f1_score ?? a.f1 ?? 0),
      )[0]
    : null;

  const formatScore = (value) => {
    if (value === undefined || value === null) return "—";

    const number = Number(value);
    if (Number.isNaN(number)) return value;

    return `${(number <= 1 ? number * 100 : number).toFixed(2)}%`;
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MACHINE LEARNING</div>
          <h1>Model Lab</h1>
          <p>Compare trained models and evaluate their performance.</p>
        </div>
      </div>

      {bestModel && (
        <section className="panel">
          <div className="eyebrow">TOP MODEL BY F1 SCORE</div>
          <h2>
            {bestModel.model ??
              bestModel.model_name ??
              bestModel.name ??
              "Best-performing model"}
          </h2>
          <p>
            Accuracy:{" "}
            {formatScore(bestModel.accuracy ?? bestModel.accuracy_score)}
            {" · "}
            F1 Score:{" "}
            {formatScore(
              bestModel.macro_f1 ??
                bestModel.f1_score ??
                bestModel.f1,
            )}
          </p>
        </section>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Model Comparison</h2>
            <p>Performance results from your trained classifiers.</p>
          </div>
        </div>

        {modelData.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {Object.keys(modelData[0]).map((key) => (
                    <th key={key}>{key.replaceAll("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modelData.map((model, index) => (
                  <tr key={index}>
                    {Object.entries(model).map(([key, value]) => (
                      <td key={key}>
                        {typeof value === "number" &&
                        (key.toLowerCase().includes("accuracy") ||
                          key.toLowerCase().includes("precision") ||
                          key.toLowerCase().includes("recall") ||
                          key.toLowerCase().includes("f1"))
                          ? formatScore(value)
                          : value == null
                            ? "—"
                            : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            No model results found. Check the model-comparison API response.
          </p>
        )}
      </section>
    </>
  );
}



function Prediction() {
  const [options, setOptions] = useState(null);
  const [features, setFeatures] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPredictionOptions()
      .then((response) => {
        const data = response.data;
        setOptions(data);

        const initialValues = {};
        (data.features || []).forEach((field) => {
          initialValues[field] = "";
        });

        setFeatures(initialValues);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load prediction options from the backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  const numericFields = [
    "age",
    "bedtime_phone_minutes",
    "screen_brightness_pct",
    "caffeine_post_5pm_mg",
    "physical_activity_min",
    "sleep_latency_min",
    "total_sleep_hours",
    "deep_sleep_pct",
    "rem_sleep_pct",
    "morning_alarm_snoozes",
    "blue_light_filter_active",
  ];

  const fieldLabels = {
    age: "Age",
    gender: "Gender",
    occupation_type: "Occupation Type",
    chronotype: "Chronotype",
    bedtime_phone_minutes: "Bedtime Phone Use (minutes)",
    primary_bedtime_app: "Primary Bedtime App",
    screen_brightness_pct: "Screen Brightness (%)",
    blue_light_filter_active: "Blue-Light Filter",
    caffeine_post_5pm_mg: "Evening Caffeine (mg)",
    physical_activity_min: "Physical Activity (minutes)",
    sleep_latency_min: "Time to Fall Asleep (minutes)",
    total_sleep_hours: "Total Sleep (hours)",
    deep_sleep_pct: "Deep Sleep (%)",
    rem_sleep_pct: "REM Sleep (%)",
    morning_alarm_snoozes: "Morning Alarm Snoozes (times)",
  };

  const fieldHints = {
    age: "Your age in years, e.g. 21.",
    bedtime_phone_minutes:
      "Phone use before sleeping, in minutes, e.g. 60.",
    screen_brightness_pct:
      "Enter a percentage between 0 and 100, e.g. 40.",
    caffeine_post_5pm_mg:
      "Caffeine consumed after 5 PM, in milligrams, e.g. 100.",
    physical_activity_min:
      "Daily physical activity in minutes, e.g. 30.",
    sleep_latency_min:
      "How many minutes it takes you to fall asleep, e.g. 15. Enter 15, not 00:15.",
    total_sleep_hours:
      "Total sleep duration in hours. Decimals are allowed, e.g. 7.5 for 7 hours 30 minutes.",
    deep_sleep_pct:
      "Percentage of total sleep spent in deep sleep, e.g. 20.",
    rem_sleep_pct:
      "Percentage of total sleep spent in REM sleep, e.g. 25.",
    morning_alarm_snoozes:
      "Number of times you press snooze after your alarm rings, e.g. 2. Do not enter a clock time.",
    blue_light_filter_active:
      "Choose On if your blue-light filter was enabled before sleep; otherwise choose Off.",
    gender: "Select the applicable dataset category.",
    occupation_type: "Choose your occupation category.",
    chronotype: "Choose the sleep-wake preference that best describes you.",
    primary_bedtime_app: "Choose the app you primarily use before bed.",
  };

  const updateFeature = (field, value) => {
    setFeatures((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const fields = options?.features || [];

    const missing = fields.filter(
      (field) =>
        features[field] === "" ||
        features[field] === undefined ||
        features[field] === null
    );

    if (missing.length > 0) {
      setError("Please complete all fields before predicting.");
      return;
    }

    for (const field of fields) {
      const value = features[field];

      if (numericFields.includes(field)) {
        const number = Number(value);

        if (!Number.isFinite(number) || number < 0) {
          setError(
            `${fieldLabels[field] || field} must be a valid non-negative number.`
          );
          return;
        }

        if (
          ["screen_brightness_pct", "deep_sleep_pct", "rem_sleep_pct"].includes(field) &&
          number > 100
        ) {
          setError(
            `${fieldLabels[field] || field} must be between 0 and 100.`
          );
          return;
        }

        if (
          field === "morning_alarm_snoozes" &&
          !Number.isInteger(number)
        ) {
          setError("Morning alarm snoozes must be a whole number.");
          return;
        }
      }
    }

    const preparedFeatures = {};

    for (const field of fields) {
      const value = features[field];

      if (numericFields.includes(field)) {
        preparedFeatures[field] = Number(value);
      } else {
        preparedFeatures[field] = value;
      }
    }

    setPredicting(true);

    try {
      const response = await predictSleepDebt(preparedFeatures);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please check your inputs and try again."
      );
    } finally {
      setPredicting(false);
    }
  };

  const resetForm = () => {
    const clearedValues = {};

    (options?.features || []).forEach((field) => {
      clearedValues[field] = "";
    });

    setFeatures(clearedValues);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <section className="prediction-loading">
        <div className="prediction-spinner" />
        <p>Preparing your prediction form...</p>
      </section>
    );
  }

  if (!options) {
    return (
      <section className="prediction-error">
        <h2>Prediction setup unavailable</h2>
        <p>{error || "Unable to load prediction options."}</p>
      </section>
    );
  }

  const fields = options.features || [];
  const choiceMap = options.options || {};

  const renderField = (field) => {
    const isPercentage = [
      "screen_brightness_pct",
      "deep_sleep_pct",
      "rem_sleep_pct",
    ].includes(field);

    const isWholeNumber = [
      "age",
      "morning_alarm_snoozes",
    ].includes(field);

    return (
      <div className="prediction-field" key={field}>
        <label htmlFor={`prediction-${field}`}>
          {fieldLabels[field] || field}
        </label>

        {field === "blue_light_filter_active" ? (
          <select
            id={`prediction-${field}`}
            value={features[field] ?? ""}
            onChange={(event) =>
              updateFeature(field, event.target.value)
            }
            required
          >
            <option value="">Select filter status</option>
            <option value="1">On — Enabled (1)</option>
            <option value="0">Off — Disabled (0)</option>
          </select>
        ) : choiceMap[field] ? (
          <select
            id={`prediction-${field}`}
            value={features[field] ?? ""}
            onChange={(event) =>
              updateFeature(field, event.target.value)
            }
            required
          >
            <option value="">Select an option</option>
            {choiceMap[field].map((choice) => (
              <option key={String(choice)} value={choice}>
                {String(choice)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`prediction-${field}`}
            type="number"
            min="0"
            max={isPercentage ? 100 : undefined}
            step={isWholeNumber ? 1 : "any"}
            value={features[field] ?? ""}
            onChange={(event) =>
              updateFeature(field, event.target.value)
            }
            placeholder={
              field === "total_sleep_hours"
                ? "e.g. 7.5"
                : field === "sleep_latency_min"
                  ? "e.g. 15"
                  : field === "morning_alarm_snoozes"
                    ? "e.g. 2"
                    : "Enter value"
            }
            required
          />
        )}

        {fieldHints[field] && (
          <small className="prediction-field-hint">
            {fieldHints[field]}
          </small>
        )}
      </div>
    );
  };

  return (
    <div className="prediction-page">
      <header className="prediction-hero">
        <div className="prediction-hero-content">
          <span className="prediction-eyebrow">
            MACHINE LEARNING · PREDICTION
          </span>

          <h1>
            Sleep Debt <span>Predictor</span>
          </h1>

          <p>
            Enter your sleep habits, screen usage, and daily routine
            to estimate your sleep-debt category using your trained
            machine learning model.
          </p>

          <div className="prediction-hero-tags">
            <span>{fields.length} Input Features</span>
            <span>Trained ML Model</span>
            <span>Instant Results</span>
          </div>
        </div>

        <div className="prediction-hero-icon">
          <span>☾</span>
          <div className="prediction-orbit orbit-one" />
          <div className="prediction-orbit orbit-two" />
        </div>
      </header>

      <div className="prediction-section-heading">
        <div>
          <span className="prediction-eyebrow">YOUR INFORMATION</span>
          <h2>Sleep Profile</h2>
          <p>Complete every field to generate your prediction.</p>
        </div>

        <span className="prediction-field-count">
          {fields.length} fields
        </span>
      </div>

      <form className="prediction-form" onSubmit={handleSubmit}>
        <div className="prediction-group">
          <div className="prediction-group-heading">
            <span className="prediction-group-number">01</span>
            <div>
              <h3>Personal Profile</h3>
              <p>Basic information and sleep preferences</p>
            </div>
          </div>

          <div className="prediction-grid">
            {fields
              .filter((field) =>
                [
                  "age",
                  "gender",
                  "occupation_type",
                  "chronotype",
                ].includes(field)
              )
              .map(renderField)}
          </div>
        </div>

        <div className="prediction-group">
          <div className="prediction-group-heading">
            <span className="prediction-group-number">02</span>
            <div>
              <h3>Screen Habits</h3>
              <p>Phone use and device settings before sleep</p>
            </div>
          </div>

          <div className="prediction-grid">
            {fields
              .filter((field) =>
                [
                  "bedtime_phone_minutes",
                  "primary_bedtime_app",
                  "screen_brightness_pct",
                  "blue_light_filter_active",
                ].includes(field)
              )
              .map(renderField)}
          </div>
        </div>

        <div className="prediction-group">
          <div className="prediction-group-heading">
            <span className="prediction-group-number">03</span>
            <div>
              <h3>Sleep & Daily Routine</h3>
              <p>Sleep duration, activity, and other daily habits</p>
            </div>
          </div>

          <div className="prediction-grid">
            {fields
              .filter((field) =>
                [
                  "caffeine_post_5pm_mg",
                  "physical_activity_min",
                  "sleep_latency_min",
                  "total_sleep_hours",
                  "deep_sleep_pct",
                  "rem_sleep_pct",
                  "morning_alarm_snoozes",
                ].includes(field)
              )
              .map(renderField)}
          </div>
        </div>

        {error && (
          <div className="prediction-error" role="alert">
            <strong>Something needs attention</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="prediction-actions">
          <button
            className="prediction-reset-button"
            type="button"
            onClick={resetForm}
            disabled={predicting}
          >
            Reset Fields
          </button>

          <button
            className="prediction-submit-button"
            type="submit"
            disabled={predicting}
          >
            {predicting ? (
              <>
                <span className="prediction-button-spinner" />
                Analyzing Profile...
              </>
            ) : (
              <>
                Predict Sleep Debt <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <section className="prediction-result">
          <div className="prediction-result-top">
            <div>
              <span className="prediction-eyebrow">
                ANALYSIS COMPLETE
              </span>
              <h2>Your Prediction</h2>
            </div>
            <span className="prediction-result-symbol">✓</span>
          </div>

          <div className="prediction-result-category">
            <span>Predicted Sleep Debt Category</span>
            <h3>{result.prediction}</h3>
            <p>
              This result is an estimate produced by your trained
              machine learning model, not a medical diagnosis.
            </p>
          </div>

          {result.probabilities &&
            Object.keys(result.probabilities).length > 0 && (
              <div className="prediction-probabilities">
                <h3>Class Probabilities</h3>
                <p>
                  Model-estimated probabilities for each category
                </p>

                {Object.entries(result.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, probability]) => (
                    <div className="prediction-probability" key={label}>
                      <div className="prediction-probability-label">
                        <span>{label}</span>
                        <strong>
                          {(Number(probability) * 100).toFixed(1)}%
                        </strong>
                      </div>

                      <div className="prediction-probability-track">
                        <div
                          className="prediction-probability-fill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                Number(probability) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </section>
      )}
    </div>
  );
}





function App() {
  const [page, setPage] = useState("Dashboard");
  const [overview, setOverview] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [overviewResponse, modelResponse] = await Promise.all([
        getOverview(),
        getModelComparison(),
      ]);

      setOverview(overviewResponse.data);
      const result = modelResponse.data;
      setModels(
        Array.isArray(result)
          ? result
          : result.models ?? result.results ?? [],
      );
    } catch (err) {
      setError(
        "Could not load dashboard data. Check that the FastAPI backend is running and its API response formats match the frontend.",
      );
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Moon size={22} />
          </div>
          <div>
            <div className="brand-title">SLEEP<span>DEBT</span></div>
            <div className="brand-caption">DATA MINING SYSTEM</div>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => setPage(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {page === name && <span className="active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-indicator" />
          <div>
            <strong>Data Mining Project</strong>
            <span>ML Classification</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {page}
          </div>
          <div className="topbar-right">
            <span className="live-dot" />
            <span>Analytics Workspace</span>
            <div className="avatar">SD</div>
          </div>
        </header>

        <div className="page-content">
          
{page === "Dashboard" ? (
  <Dashboard overview={overview} models={models} />
) : page === "Dataset Explorer" ? (
  <DatasetExplorer />
) : page === "Visualizations" ? (
  <Visualizations />
): page === "Model Lab" ? (
  <ModelLab models={models} />
): page === "Prediction" ? (
  <Prediction />
): (
  <div className="panel">
    <h2>{page}</h2>
    <p>This section is coming soon.</p>
    <button onClick={() => setPage("Dashboard")}>
      Return to Dashboard
    </button>
  </div>
)}

          <footer className="app-footer">
            <span>Sleep Debt Data Mining</span>
            <span>React · FastAPI · Scikit-learn</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
