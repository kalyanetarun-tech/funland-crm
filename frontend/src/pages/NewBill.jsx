import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function NewBill() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ customerId: "", gstEnabled: true, discount: 0 });
  const [selItems, setSelItems] = useState([]);
  const [selGames, setSelGames] = useState([]);

  useEffect(() => {
    api.get("/customers").then(r => setCustomers(r.data.data || r.data));
    api.get("/items").then(r => setItems(r.data.data || r.data));
    api.get("/games").then(r => setGames(r.data.data || r.data));
  }, []);

  const subtotal = [...selItems, ...selGames].reduce((s, i) => s + i.price * i.qty, 0);
  const disc = (subtotal * form.discount) / 100;
  const gst = form.gstEnabled ? ((subtotal - disc) * 18) / 100 : 0;
  const total = subtotal - disc + gst;

  const submit = async () => {
    if (!form.customerId) return alert("Customer select karo");
    await api.post("/bills", { customer: form.customerId, items: selItems, games: selGames, gstEnabled: form.gstEnabled, total });
    nav("/bills");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">New Bill - GST {form.gstEnabled ? "ON" : "OFF"}</h2>
      <select className="border p-2 rounded w-full mb-4" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
        <option value="">Select Customer</option>
        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <label className="flex gap-2 mb-4"><input type="checkbox" checked={form.gstEnabled} onChange={e => setForm({...form, gstEnabled: e.target.checked})} /> GST 18%</label>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-2 rounded h-72 overflow-auto">{items.map(it => <div key={it._id} className="flex justify-between py-1">{it.name} - ₹{it.price}<button onClick={() => setSelItems([...selItems, {itemId: it._id, name: it.name, price: it.price, qty:1}])} className="bg-blue-600 text-white px-2 rounded">+</button></div>)}</div>
        <div className="border p-2 rounded h-72 overflow-auto">{games.map(g => <div key={g._id} className="flex justify-between py-1">{g.name} - ₹{g.price}<button onClick={() => setSelGames([...selGames, {gameId: g._id, name: g.name, price: g.price, qty:1}])} className="bg-green-600 text-white px-2 rounded">+</button></div>)}</div>
      </div>
      <div className="mt-4 p-3 bg-gray-100 rounded font-bold">Total: ₹{total} (Sub: {subtotal} - Disc: {disc} + GST: {gst})</div>
      <button onClick={submit} className="mt-4 w-full bg-black text-white py-3 rounded">Create Bill</button>
    </div>
  );
}