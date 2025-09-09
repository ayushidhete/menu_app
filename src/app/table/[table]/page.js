"use client";
import React, { use,useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import menuData from "@/Data/menu.json";
import styles from "../../styles/tablePage.module.css";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";

export default function TablePage({ params }) {
  const {table} =use(params) ;
  const searchParams = useSearchParams();
  const editing = searchParams?.get("edit") === "true";
  const router = useRouter();

  const [qty, setqty] = useState({});
  const [showOrder, setShowOrder] = useState(editing ? true : false);
  const [saving, setSaving] = useState(false);

  const inc = (k) => setqty((prev) => ({ ...prev, [k]: (prev[k] || 0) + 1 }));
  const dec = (k) =>
    setqty((prev) => {
      const next = Math.max((prev[k] || 0) - 1, 0);
      const copy = { ...prev, [k]: next };
      if (next === 0) delete copy[k];
      return copy;
    });

  const cart = useMemo(() => {
    const items = [];
    for (const [category, list] of Object.entries(menuData)) {
      for (const it of list) {
        const key = `${category}::${it.name}`;
        const count = qty[key] || 0;
        if (count > 0) items.push({ key, category, ...it, qty: count });
      }
    }
    return items;
  }, [qty]);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  useEffect(() => {
    if (!editing) return;
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/orders/${table}`);
        const data = res.data?.message;
        if (!mounted) return;
        if (!data) {
          toast.error("No existing order found");
          return;
        }
        const newQty = {};
        for (const it of data.item || []) {
          const key = `${it.category}::${it.name}`;
          newQty[key] = it.qty || 1;
        }
        setqty(newQty);
        setShowOrder(true);
      } catch (e) {
        console.error("Failed to load order for editing:", e?.response ?? e);
        toast.error("Unable to load order for editing");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [editing, table]);

  async function placeOrder() {
    if (cart.length === 0 || saving) return;
    try {
      setSaving(true);
      const payload = {
        table_num: table,
        items: cart.map(({ category, name, price, qty }) => ({ category, name, price, qty })),
        total,
      };

      let res;
      if (editing) {
        res = await axios.put(`/api/orders/${table}`, payload);
        if (res.status === 200) {
          toast.success("Order updated!", { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
        }
      } else {
        res = await axios.post("/api/orders", payload);
        if (res.status === 201) {
          toast.success("Order Placed!!", { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
        }
      }

      router.push("/orders");
    } catch (err) {
      console.error("Error in order placing/updating", err?.response ?? err);
      const status = err?.response?.status;
      if (status === 409) {
        toast.error("Order Already Exists", { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
        return;
      }
      toast.error("Order not placed/updated", { position: "top-center", autoClose: 3000, theme: "dark", transition: Bounce });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" transition={Bounce} />
      <div className={styles.page}>
        <header className={styles.topbar}>
          <h1 className={styles.heading}>Table : {table}</h1>
          <div className={styles.toggleGroup}>
            <button className={`${styles.toggleBtn} ${!showOrder ? styles.active : ""}`} onClick={() => setShowOrder(false)}>
              Menu
            </button>
            <button className={`${styles.toggleBtn} ${showOrder ? styles.active : ""}`} onClick={() => setShowOrder(true)} disabled={cart.length === 0} title={cart.length === 0 ? "No items yet" : "View current order"}>
              Orders
            </button>
          </div>
        </header>

        {!showOrder && (
          <>
            {Object.entries(menuData).map(([category, items]) => (
              <div key={category} className={styles.category}>
                <h2 className={styles.categoryTitle}>{category}</h2>
                <ul className={styles.itemList}>
                  {items.map((item) => {
                    const k = `${category}::${item.name}`;
                    const count = qty[k] || 0;
                    return (
                      <li key={k} className={styles.card}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.price}>₹{item.price}</span>
                        </div>
                        <div className={styles.controls}>
                          <button className={styles.btn} onClick={() => dec(k)} disabled={count === 0} aria-label={`Decrease ${item.name}`}>
                            –
                          </button>
                          <span className={styles.count}>{count}</span>
                          <button className={styles.btn} onClick={() => inc(k)} aria-label={`Increase ${item.name}`}>
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </>
        )}

        {showOrder && (
          <section className={styles.orderWrap}>
            <h2 className={styles.categoryTitle}>Current Order</h2>

            {cart.length === 0 ? (
              <p className={styles.muted}>No items yet.</p>
            ) : (
              <>
                <ul className={styles.sumList}>
                  {cart.map((it) => (
                    <li key={it.key} className={styles.sumRow}>
                      <div className={styles.sumLeft}>
                        <span className={styles.sumName}>{it.name}</span>
                        <em className={styles.sumQty}>× {it.qty}</em>
                      </div>
                      <span className={styles.sumAmount}>₹{it.price * it.qty}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.totalRow}>
                  <span>Total</span>
                  <strong>₹{total}</strong>
                </div>

                <div className={styles.actionsRow}>
                  <button className={styles.clearBtn} onClick={() => setqty({})}>
                    Clear
                  </button>
                  <button className={styles.primaryBtn} onClick={placeOrder} disabled={saving === true}>
                    {saving === true ? "Saving..." : editing ? "Update Order" : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}
