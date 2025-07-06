import React from "react";
import VendorNavbar from "../components/VendorNavbar";
import "./VendorDashboard.css";

// Mock data for demo
const salesData = [
  { month: "Jan", revenue: 120, meals: 8 },
  { month: "Feb", revenue: 180, meals: 12 },
  { month: "Mar", revenue: 240, meals: 16 },
  { month: "Apr", revenue: 200, meals: 14 },
  { month: "May", revenue: 300, meals: 20 },
];
const summary = {
  posted: 50,
  pickedUp: 44,
  wasted: 6,
  revenue: 1040,
  topMeals: [
    { title: "Chapati Pack", count: 18 },
    { title: "Githeri Lunch Combo", count: 14 },
    { title: "Vegetarian Pilau", count: 12 },
  ],
  customers: 22,
  repeatCustomers: 7,
  foodSavedKg: 38,
  co2SavedKg: 95,
};

const VendorReports = () => {
  return (
    <>
      <VendorNavbar />
      <main className="dashboard-container">
        <div className="greeting">
          <h1>📊 Vendor Reports</h1>
          <p>See your impact and business performance at a glance.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="icon">🍛</span>
            <h3>{summary.posted}</h3>
            <p>Meals Posted</p>
          </div>
          <div className="stat-box">
            <span className="icon">✅</span>
            <h3>{summary.pickedUp}</h3>
            <p>Picked Up</p>
          </div>
          <div className="stat-box">
            <span className="icon">🗑️</span>
            <h3>{summary.wasted}</h3>
            <p>Wasted</p>
          </div>
          <div className="stat-box">
            <span className="icon">💰</span>
            <h3>KES {summary.revenue}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stats-grid" style={{ marginTop: 24 }}>
          <div className="stat-box">
            <span className="icon">👥</span>
            <h3>{summary.customers}</h3>
            <p>Unique Customers</p>
          </div>
          <div className="stat-box">
            <span className="icon">🔁</span>
            <h3>{summary.repeatCustomers}</h3>
            <p>Repeat Customers</p>
          </div>
          <div className="stat-box">
            <span className="icon">🌱</span>
            <h3>{summary.foodSavedKg} kg</h3>
            <p>Food Saved</p>
          </div>
          <div className="stat-box">
            <span className="icon">🌍</span>
            <h3>{summary.co2SavedKg} kg</h3>
            <p>CO₂ Saved</p>
          </div>
        </div>
        <h2 className="section-title" style={{ marginTop: 36 }}>
          📈 Sales & Meals Over Time
        </h2>
        <div style={{ overflowX: "auto", marginBottom: 32 }}>
          <table
            style={{
              width: 480,
              margin: "auto",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(44,122,123,0.07)",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#e6fffa" }}>
                <th style={{ padding: 10 }}>Month</th>
                <th style={{ padding: 10 }}>Revenue (KES)</th>
                <th style={{ padding: 10 }}>Meals Sold</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((row) => (
                <tr key={row.month}>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    {row.month}
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    {row.revenue}
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    {row.meals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="section-title">🏆 Top Meals</h2>
        <div className="meals-grid">
          {summary.topMeals.map((meal, idx) => (
            <div className="meal-card" key={idx}>
              <img src={`/meal${idx + 1}.jpg`} alt={meal.title} />
              <div className="meal-info">
                <h4>{meal.title}</h4>
                <p className="qty">Sold: {meal.count}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default VendorReports;
