"use client";
export const dynamic = "force-dynamic"
import styles from "./styles/home.module.css";
import { useState } from "react";
import { Macondo } from "next/font/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { 
  MdAddCircleOutline, 
  MdViewList, 
  MdDashboard,MdTableRestaurant, MdCoffee,MdRestaurantMenu 
} from "react-icons/md";
import { FaCoffee, FaSeedling } from "react-icons/fa";

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
          theme: "light",
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
      toast.error("Please try again...", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/orders/${tableNum}`);
      toast.info("Order Deleted...", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      setShowPopUp(false);
      setTableNum("");
    } catch {
      toast.error("Error in Deleting Order", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
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
      <ToastContainer transition={Bounce} />

      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* MAIN AREA */}
      <main className={styles.main}>
        {/* background blobs */}
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>

        {/* Background doodles */}
<div className={styles.doodles}>
  <MdCoffee className={`${styles.doodle} ${styles.doodleCup}`} />
  <FaSeedling className={`${styles.doodle} ${styles.doodleBean}`} />
  <FaCoffee className={`${styles.doodle} ${styles.doodleCroissant}`} />
  <MdRestaurantMenu className={`${styles.doodle} ${styles.doodleMenu}`} />
</div>


        {/* CARD */}
        <div className={styles.mainCard}>
          {/* <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>
            Manage your café operations seamlessly.
          </p> */}

          <div className={styles.inputWrapper}>
              <MdTableRestaurant className={styles.inputIconLeft} />
  <input
    type="number"
    value={tableNum}
    className={styles.input}
    placeholder="Enter Table Number"
    onChange={(e) => setTableNum(e.target.value)}
  />
</div>


        <button
  className={`${styles.primaryBtn} ${macondo.className}`}
  onClick={goToTablePage}
>
  <MdAddCircleOutline size={20} />
  New Order
</button>

<button
  onClick={() => router.push(`/orders`)}
  className={`${styles.secondaryBtn} ${macondo.className}`}
>
  <MdViewList size={20} />
  View Orders
</button>

<button
  onClick={() => router.push(`/dashboard`)}
  className={`${styles.secondaryBtn} ${macondo.className}`}
>
  <MdDashboard size={20} />
  Dashboard
</button>


         <div className={styles.lineDivider}></div>

          <Link href="./menu" className={styles.menuLink}>
          <MdRestaurantMenu size={18} />
            View Full Menu
          </Link>
        </div>
      </main>

      {/* POPUP (NO CHANGE) */}
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
