import React from "react";
import menuData from "@/Data/menu.json";  
import style from '../styles/menu.module.css'
const Menu = () => {
    return (
        <div className={style.main_div}>
            <h1 className="text-2xl font-bold mb-6 ">Menu</h1>

            {Object.entries(menuData).map(([category, items]) => (
                <div key={category} className="mb-6">
                    <h2 className={style.category_name}>{category}</h2>
                    <ul className="space-y-1">
                        {items.map((item, index) => (
                            <li key={index} className={style.menu_item}>
                                <span className={style.item_name}>{item.name}</span>
                                <span className={style.item_price}>₹{item.price}</span>
                            </li>
                        ))}

                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Menu;
