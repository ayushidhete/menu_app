"use client";
export const dynamic = "force-dynamic";

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
  MdDashboard,
  MdTableRestaurant,
  MdRestaurantMenu,
  MdCoffee,
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
      if (!tableNum.trim()) {
        toast.error("Invalid Table Number", { transition: Bounce });
        return;
      }

      const res = await axios.get(`/api/orders/${tableNum}`);
      if (res.data?.message) {
        setShowPopUp(true);
        return;
      }

      router.push(`/table/${tableNum}`);
    } catch {
      toast.error("Please try again", { transition: Bounce });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/orders/${tableNum}`);
      toast.info("Order Deleted", { transition: Bounce });
      setShowPopUp(false);
      setTableNum("");
    } catch {
      toast.error("Error deleting order", { transition: Bounce });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer transition={Bounce} />

      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      {/* BACKGROUND ONLY */}
      <div className={styles.pageBg}>
         <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>

        <div className={styles.doodles}>
          <MdCoffee className={`${styles.doodle} ${styles.doodleCup}`} />
          <FaSeedling className={`${styles.doodle} ${styles.doodleBean}`} />
          <FaCoffee className={`${styles.doodle} ${styles.doodleCroissant}`} />
          <MdRestaurantMenu className={`${styles.doodle} ${styles.doodleMenu}`} />
        </div>
      </div>

      {/* MAIN HERO */}
      <main className={styles.main}>
        <div className={styles.mainCard}>
          <div className={styles.inputWrapper}>
            <MdTableRestaurant className={styles.inputIconLeft} />
            <input
              type="number"
              className={styles.input}
              placeholder="Enter Table Number"
              value={tableNum}
              onChange={(e) => setTableNum(e.target.value)}
            />
          </div>

          <button
            className={`${styles.primaryBtn} ${macondo.className}`}
            onClick={goToTablePage}
          >
            <MdAddCircleOutline /> New Order
          </button>

          <button
            className={`${styles.secondaryBtn} ${macondo.className}`}
            onClick={() => router.push("/orders")}
          >
            <MdViewList /> View Orders
          </button>

          <button
            className={`${styles.secondaryBtn} ${macondo.className}`}
            onClick={() => router.push("/dashboard")}
          >
            <MdDashboard /> Dashboard
          </button>

          <div className={styles.lineDivider}></div>

          <Link href="/menu" className={styles.menuLink}>
            <MdRestaurantMenu /> View Full Menu
          </Link>
        </div>
      </main>

      {/* ⭐ OUR FAVOURITES */}
      <section className={styles.favoritesSection}>
        <h2 className={styles.favoritesTitle}> Specials</h2>

        <div className={styles.favoritesGrid}>
          {[
            {
              img: "/fav-cappuccino.png",
              name: "Cappuccino",
              desc: "Rich espresso & steamed milk",
              price: "$4.50",
            },
            {
              img: "/fav-avo-toast.png",
              name: "Avo Toast",
              desc: "Avocado, seeds & lemon",
              price: "$8.50",
            },
            {
              img: "/fav-croissant.png",
              name: "Butter Croissant",
              desc: "Freshly baked & flaky",
              price: "$3.75",
            },
          ].map((item) => (
            <div key={item.name} className={styles.favoriteCard}>
              <img src={item.img} alt={item.name} />
              <div className={styles.favoriteInfo}>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <span>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPUP */}
      {showPopUp && (
        <div className={styles.overlay} onClick={() => setShowPopUp(false)}>
          <div
            className={styles.pop_up_div}
            onClick={(e) => e.stopPropagation()}
          >
            <p>Order already exists for table {tableNum}</p>
            <div className={styles.pop_upButtondiv}>
              <button
                onClick={() => router.push(`/table/${tableNum}?edit=true`)}
              >
                Update Order
              </button>
              <button onClick={deleteOrder}>Cancel Order</button>
              <button onClick={() => setShowPopUp(false)}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
