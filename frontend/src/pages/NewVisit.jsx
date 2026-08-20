import { useState } from "react";

const ALL_ITEMS = [
  { id: 1, name: "Veg Burger", price: 80, category: "Food" },
  { id: 2, name: "Pizza", price: 150, category: "Food" },
  { id: 3, name: "Cold Drink", price: 40, category: "Beverage" },
  { id: 4, name: "Coffee", price: 60, category: "Beverage" },
  { id: 5, name: "Trampoline", price: 150, category: "Activities" },
  { id: 6, name: "Go Kart", price: 200, category: "Activities" },
  { id: 7, name: "Bowling", price: 120, category: "Activities" },
];

export default function Visit() {
  const [filter, setFilter] = useState("All");
  const [cart, setCart] = useState([]);

  const list = filter === "All" ? ALL_ITEMS : ALL_ITEMS.filter(i => i.category === filter);
  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          {["All","Food","Beverage","Activities"].map(c => (
            <button key={c} onClick={()=>setFilter(c)} 
            className={`px-4 py-2 rounded-full ${filter===c ? 'bg-black text-white' : 'bg-gray-100'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {list.map(item => (
            <div key={item.id} onClick={()=>setCart([...cart, item])} className="border p-3 rounded-lg cursor-pointer hover:bg-orange-50">
              <p className="font-bold">{item.name}</p>
              <p>₹{item.price} - {item.category}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-72 border p-4 rounded-xl">
        <h3 className="font-bold">Customer & Bill</h3>
        <p className="mt-4">Total: ₹{total}.00</p>
        <button className="w-full bg-black text-white mt-2 py-2 rounded-full">Pay ₹{total}.00</button>
      </div>
    </div>
  );
}