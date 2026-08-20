import { useState } from "react";

const ITEMS = [
  { id: 1, name: "Veg Burger", price: 80, category: "Food" },
  { id: 2, name: "Cheese Pizza", price: 150, category: "Food" },
  { id: 3, name: "Cold Drink", price: 40, category: "Beverage" },
  { id: 4, name: "Coffee", price: 60, category: "Beverage" },
  { id: 5, name: "Trampoline Park", price: 150, category: "Activities" },
  { id: 6, name: "Go Kart", price: 200, category: "Activities" },
  { id: 7, name: "Bowling", price: 120, category: "Activities" },
];

export default function NewBill() {
  const [filter, setFilter] = useState("All");
  
  const filtered = filter === "All" ? ITEMS : ITEMS.filter(i => i.category === filter);

  return (
    <div>
      <button onClick={() => setFilter("All")}>All</button>
      <button onClick={() => setFilter("Food")}>Food</button>
      <button onClick={() => setFilter("Beverage")}>Beverage</button>
      <button onClick={() => setFilter("Activities")}>Activities</button>
      
      {filtered.map(item => (
        <div key={item.id}>{item.name} - ₹{item.price}</div>
      ))}
    </div>
  )
}