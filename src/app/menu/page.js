import menuData from "@/Data/menu.json";
import styles from "../styles/menu.module.css";

export default function MenuPage() {
  return (
    <div className={styles.main_div}>
      <h1 className={styles.title}>Menu</h1>

      {Object.entries(menuData).map(([category, items]) => (
        <div key={category}>
          <h2 className={styles.category_name}>{category}</h2>
          <ul>
            {items.map((item, i) => (
              <li key={i} className={styles.menu_item}>
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
