"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/styles/order.module.css";
import axios from "axios";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { ToastContainer, toast, Bounce } from "react-toastify";

const Page = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [completing, setCompleting] = useState({});
  const unsubscribers = useRef({});

  const subscribeToCheckboxes = (orderId) => {
    if (unsubscribers.current[orderId]) return;

    const ref = doc(db, "checkboxes", orderId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const snapData = snap.data();
      const checks = Array.isArray(snapData.checks) ? snapData.checks : [];

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                item: o.item.map((it, idx) => ({
                  ...it,
                  checked: checks[idx] ?? false,
                })),
              }
            : o
        )
      );
    });

    unsubscribers.current[orderId] = unsubscribe;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders");
      const normalized = res.data.map((o) => ({
        ...o,
        item: o.item.map((it) => ({ ...it, checked: it.checked ?? false })),
      }));
      setOrders(normalized);

      normalized.forEach((order) => subscribeToCheckboxes(order._id));
    } catch (err) {
      console.error("Error in Loading Orders", err);
      alert("Error in Loading Orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => {
      Object.values(unsubscribers.current).forEach((fn) => {
        if (typeof fn === "function") fn();
      });
      unsubscribers.current = {};
    };
  }, []);

  useEffect(() => {
    let pusherClient;
    let channel;

    (async () => {
      const Pusher = (await import("pusher-js")).default;
      pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      channel = pusherClient.subscribe("food-orders");

      channel.bind("Order-Created", (newOrder) => {
        const orderWithChecked = {
          ...newOrder,
          item: newOrder.item.map((it) => ({
            ...it,
            checked: it.checked ?? false,
          })),
        };
        setOrders((prev) => [orderWithChecked, ...prev]);
        subscribeToCheckboxes(newOrder._id);
      });

      channel.bind("Order-Updated", (updated) => {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === updated._id
              ? {
                  ...o,
                  ...updated,
                  item: updated.item.map((it, idx) => ({
                    ...it,
                    checked: o.item?.[idx]?.checked ?? false,
                  })),
                }
              : o
          )
        );
      });

      channel.bind("Order-Deleted", (deleted) => {
        setOrders((prev) => prev.filter((o) => o._id !== deleted._id));
        if (unsubscribers.current[deleted._id]) {
          unsubscribers.current[deleted._id]();
          delete unsubscribers.current[deleted._id];
        }
      });
    })();

    return () => {
      try {
        if (channel) {
          channel.unbind_all();
          channel.unsubscribe();
        }
        if (pusherClient) pusherClient.disconnect();
      } catch (e) {
        console.log("Pusher Error ", e);
      }
    };
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheck = async (orderId, idx) => {
    const order = orders.find((item) => item._id === orderId);
    if (!order) return;

    const updatedChecks = order.item.map((it, i) =>
      i === idx ? !(it.checked ?? false) : it.checked ?? false
    );

    await setDoc(doc(db, "checkboxes", orderId), { checks: updatedChecks });
  };

  const cleanupOrder = async (orderId) => {
    if (unsubscribers.current[orderId]) {
      unsubscribers.current[orderId]();
      delete unsubscribers.current[orderId];
    }
    try {
      await deleteDoc(doc(db, "checkboxes", orderId));
    } catch (e) {
      console.warn("Failed to delete checkbox doc", e);
    }
  };

  const completeOrder = async (order) => {
    const id = order._id;
    setCompleting((s) => ({ ...s, [id]: true }));

    try {
      const res = await axios.post("/api/orders/complete", {
        table_no: order.table_no,
      });

      if (res.status === 200) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        await cleanupOrder(id);
        toast.success("Order Completed & Archived!", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
          transition: Bounce,
        });
      } else {
        toast.error("Could not complete order", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
          transition: Bounce,
        });
      }
    } catch (err) {
      console.error("Error completing order:", err);
      toast.error("Error completing order", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      setCompleting((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <div className={styles.container}>
        {orders.map((order) => {
          const allChecked = order.item.every((it) => it.checked ?? false);

          return (
            <div key={order._id} className={styles.card}>
              <div
                className={styles.cardHeader}
                onClick={() => toggleExpand(order._id)}
              >
                <h3>Table {order.table_no}</h3>
                <p>Status: {order.status}</p>
                <p>Total: ₹{order.total}</p>
              </div>

              {expanded[order._id] && (
                <div className={styles.cardBody}>
                  <ul>
                    {order.item.map((it, idx) => (
                      <li key={idx}>
                        <label>
                          <input
                            type="checkbox"
                            className={styles.customCheckbox}
                            checked={it.checked ?? false}
                            onChange={() => handleCheck(order._id, idx)}
                          />
                          {it.name} — ₹{it.price} × {it.qty}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={!allChecked || completing[order._id]}
                    onClick={() => completeOrder(order)}
                  >
                    {completing[order._id] ? "Completing..." : "Complete Order"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Page;
