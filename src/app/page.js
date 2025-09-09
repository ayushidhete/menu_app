"use client";
import styles from "./styles/home.module.css";
import { useState } from "react";
import { Macondo } from "next/font/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";

const macondo = Macondo({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const [tableNum, setTableNum] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const goToTablePage = async () => {
    try {
      setLoading(true);
      if (!tableNum.toString().trim()) {
        toast.error("Invalid Table Number", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
          transition: Bounce,
        });
        return;
      }
      const res = await axios.get(`/api/orders/${tableNum}`);
      const data = res.data;
      if (data?.message) {
        setShowPopUp(true);
        return;
      }
      router.push(`/table/${tableNum}`);
    } catch (err) {
      console.error("goToTablePage error:", err?.response ?? err);
      toast.error("Please try again...", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`/api/orders/${tableNum}`);
      console.log("delete res:", res.data);
      toast.info("Order Deleted...", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });
      setShowPopUp(false);
      setTableNum("");
    } catch (err) {
      console.error("deleteOrder error:", err?.response ?? err);
      toast.error("Error in Deleting Order", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const closepopUp = () => {
    setTableNum("");
    setShowPopUp(false);
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

      {/* Background overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-white/10 to-black/40 backdrop-blur-lg"></div>
      <div className="absolute inset-0 bg-black/30 rounded-2xl pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.6)]"></div>

      <div className={styles.nav}>
        <input
          type="number"
          value={tableNum}
          className={styles.input}
          placeholder="Enter Table Number..."
          onChange={(e) => setTableNum(e.target.value)}
        />

        <button
          className={`${styles.button} ${macondo.className}`}
          onClick={goToTablePage}
        >
          New Order
        </button>

        <button
          onClick={() => router.push(`/orders`)}
          className={`${styles.button} ${macondo.className}`}
        >
          View Orders
        </button>

        {/* ✅ New Dashboard Button */}
        <button
          onClick={() => router.push(`/dashboard`)}
          className={`${styles.button} ${macondo.className}`}
        >
          Dashboard
        </button>

        <Link href="./menu" className={styles.menu_link}>
          Menu
        </Link>
      </div>

      {showPopUp && (
        <div className={styles.overlay} onClick={closepopUp}>
          <div
            className={styles.pop_up_div}
            onClick={(e) => e.stopPropagation()}
          >
            <p>Order Already Exists for {tableNum}</p>
            <div className={styles.pop_upButtondiv}>
              <button
                className={styles.popUpbutton}
                onClick={() => {
                  setShowPopUp(false);
                  router.push(`/table/${tableNum}?edit=true`);
                }}
              >
                Update Order
              </button>
              <button className={styles.popUpbutton} onClick={deleteOrder}>
                Cancel Order
              </button>
              <button className={styles.popUpbutton} onClick={closepopUp}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
