"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/dashboard.module.css";

export default function SimpleDashboard() {
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ revenue: 0, totalOrders: 0 });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.error) {
          setError(data.error);
          setKpis({ revenue: 0, totalOrders: 0 });
          setOrders([]);
          return;
        }
        setKpis(data.kpis || { revenue: 0, totalOrders: 0 });
        setOrders(data.recent || []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load data");
        setKpis({ revenue: 0, totalOrders: 0 });
        setOrders([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [days]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Dashboard</h1>
          <p className={styles.subtitle}>Total amount and completed orders</p>
        </div>
        <div className={styles.controls}>
          <label>Range:</label>
          <select value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </header>

      <section className={styles.kpis}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Amount</div>
          <div className={styles.kpiValue}>
            ₹{loading ? "..." : kpis.revenue ?? 0}
          </div>
          <div className={styles.kpiNote}>
            {loading ? "" : `${kpis.totalOrders ?? 0} orders`}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Status</div>
          <div className={styles.kpiValue}>
            {loading ? "Loading..." : error ? "Error" : "Ready"}
          </div>
          <div className={styles.kpiNote}>
            {error ? error : "Showing completed orders"}
          </div>
        </div>
      </section>

      <section className={styles.ordersSection}>
        <h2 className={styles.sectionTitle}>Recent Completed Orders</h2>
        {loading ? (
          <div className={styles.message}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className={styles.message}>No completed orders.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Total (₹)</th>
                  <th>Completed At</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.table_no}</td>
                    <td>₹{o.total}</td>
                    <td>
                      {new Date(o.completedAt || o.createdAt).toLocaleString()}
                    </td>
                    <td>
                      {(o.item || [])
                        .map((it) => `${it.name} x${it.qty}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
