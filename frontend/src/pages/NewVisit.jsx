import { useState, useEffect } from "react";
const API = "https://funland.djpsindore.cloud";

export default function NewVisit(){
  const [allItems, setAllItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({name:"", phone:"", members:"1"});
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadLive = async()=>{
    const [itemsRes, gamesRes, pkgRes] = await Promise.all([
      fetch(`${API}/api/items`, {headers}).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/games`, {headers}).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/packages`, {headers}).then(r=>r.json()).catch(()=>[])
    ]);
    const arr1 = Array.isArray(itemsRes)? itemsRes : [];
    const arr2 = Array.isArray(gamesRes)? gamesRes : [];
    const arr3 = Array.isArray(pkgRes)? pkgRes : [];
    const pkgs = arr3.map(p=>({_id:p._id||p.id, name:p.name, price:p.price||p.total||0, category:"Packages", isPackage:true}));
    setAllItems([...arr1,...arr2,...pkgs]);
  };
  useEffect(()=>{ loadLive(); },[]);

  const total = cart.reduce((s,i)=> s + (i.price*i.qty), 0);
  const addToBill = (it)=> {
    setCart(prev=>{
      const ex = prev.find(x=>x._id===it._id);
      if(ex) return prev.map(x=>x._id===it._id? {...x, qty:x.qty+1}:x);
      return [...prev, {...it, qty:1}];
    });
  };

  const categories = ["All","Food","Beverage","Activities","Packages"];
  const filtered = filter==="All"? allItems : allItems.filter(i=> filter==="Packages"? i.isPackage : i.category===filter);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">

      {/* ===== CUSTOMER DETAILS - TOP PE HAMESHA DIKHEGA (MOBILE + LAPTOP) ===== */}
      <div className="sticky top-0 z-20 bg-white border-2 border-black rounded-xl p-3 mb-3 shadow-lg">
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <input placeholder="Customer Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} className="border p-2 rounded w-1/2 md:w-40" />
            <input placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} className="border p-2 rounded w-1/2 md:w-32" />
            <input placeholder="Members" type="number" value={customer.members} onChange={e=>setCustomer({...customer,members:e.target.value})} className="border p-2 rounded w-20" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="font-bold">Total: ₹{total}</div>
            <button className="bg-black text-white px-6 py-2 rounded-full">Pay ₹{total}</button>
          </div>
        </div>
        {/* Cart items chote me dikhenge */}
        {cart.length>0 && <div className="mt-2 text-xs flex gap-2 flex-wrap">{cart.map(c=><span key={c._id} className="bg-gray-100 px-2 py-1 rounded">{c.name} x{c.qty}</span>)}</div>}
      </div>

      {/* ===== CATEGORY FILTER ===== */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {categories.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} className={`px-5 py-2 rounded-full font-bold whitespace-nowrap ${filter===c?'bg-black text-white':'bg-white border'}`}>{c}</button>
        ))}
        <button onClick={loadLive} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-full">↻</button>
      </div>

      {/* ===== ITEMS GRID + CUSTOMER BILL MIDDLE ME (LAPTOP PE RIGHT, MOBILE PE BEECH) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Items */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(it=>(
            <div key={it._id} onClick={()=>addToBill(it)} className="border p-4 rounded-xl bg-white shadow-sm hover:shadow-md cursor-pointer active:scale-95">
              <div className="font-bold">{it.name}</div>
              <div className="text-sm text-gray-500">₹{it.price} - {it.category}</div>
            </div>
          ))}
        </div>

        {/* BILL DETAILS - MIDDLE/BEECH ME BHI DIKHEGA */}
        <div className="bg-white border rounded-xl p-4 h-fit sticky top-[90px]">
          <h3 className="font-bold text-lg mb-3">Customer & Bill</h3>
          <div className="space-y-2 text-sm">
            <div>Name: {customer.name||'-'}</div>
            <div>Phone: {customer.phone||'-'}</div>
            <div>Members: {customer.members}</div>
            <hr/>
            {cart.map(c=><div key={c._id} className="flex justify-between"><span>{c.name} x{c.qty}</span><span>₹{c.price*c.qty}</span></div>)}
            <hr/>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total}</span></div>
            <button className="w-full bg-black text-white py-3 rounded-full mt-3 text-lg">Pay ₹{total}</button>
          </div>
        </div>

      </div>
    </div>
  )
}