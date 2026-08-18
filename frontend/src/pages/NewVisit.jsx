import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function NewVisit() {
  const nav = useNavigate();
  const [tab, setTab] = useState("games");
  const [games, setGames] = useState([]);
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(true); // <-- GST ON/OFF Toggle
  const [discountType, setDiscountType] = useState("%");
  const [discountVal, setDiscountVal] = useState(0);

  const [customer, setCustomer] = useState({
    name: "", phone: "", email: "", gstin: "", stateCode: ""
  });

  useEffect(() => {
    api.get("/games").then(r => setGames(r.data.data || r.data)).catch(()=>{});
    api.get("/packages").then(r => setPackages(r.data.data || r.data)).catch(()=>{});
    // agar items endpoint alag hai to
    api.get("/items").then(r => {
      if(r.data.length > 0 && games.length === 0) setGames(r.data.data || r.data)
    }).catch(()=>{});
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(p => p._id === item._id);
      if(ex) return prev.map(p => p._id === item._id ? {...p, qty: p.qty+1} : p);
      return [...prev, {...item, qty: 1, price: item.price || item.rate || 0}];
    });
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discountType === "%" ? (subtotal * discountVal)/100 : discountVal;
  const afterDisc = subtotal - discountAmt;
  const gstAmt = gstEnabled ? (afterDisc * 18)/100 : 0;
  const total = afterDisc + gstAmt;

  const createBill = async () => {
    if(!customer.name || !customer.phone) return alert("Name aur Phone bharo!");
    
    // 1. Customer banao ya dhundo
    let custId;
    try{
      const res = await api.post("/customers", customer);
      custId = res.data._id || res.data.data._id;
    } catch(e){
      // agar customer pehle se hai to search karke lo
      const res = await api.get(`/customers?phone=${customer.phone}`);
      custId = res.data[0]?._id || res.data.data?.[0]?._id;
    }

    // 2. Bill banao
    await api.post("/bills", {
      customer: custId,
      items: cart,
      subtotal, discount: discountAmt, gst: gstAmt, total,
      gstEnabled, paymentMode: "Cash", status: "Paid"
    });
    alert("Bill Created! Total: ₹" + total);
    nav("/bills");
  };

  const list = (tab === "games" ? games : packages).filter(g => 
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      {/* LEFT */}
      <div className="col-span-8 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs tracking-widest text-gray-400 font-bold">CUSTOMER DETAILS</h3>
            <label className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-sm cursor-pointer">
              <input type="checkbox" checked={gstEnabled} onChange={e=>setGstEnabled(e.target.checked)} />
              GST 18% {gstEnabled ? "ON" : "OFF"}
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name*" className="border p-2 rounded" value={customer.name} onChange={e=>setCustomer({...customer, name: e.target.value})} />
            <input placeholder="Phone*" className="border p-2 rounded" value={customer.phone} onChange={e=>setCustomer({...customer, phone: e.target.value})} />
            <input placeholder="Email" className="border p-2 rounded" value={customer.email} onChange={e=>setCustomer({...customer, email: e.target.value})} />
            <input placeholder="Customer GSTIN (optional - B2B tax invoice ke liye)" className="border p-2 rounded col-span-2" value={customer.gstin} onChange={e=>setCustomer({...customer, gstin: e.target.value})} />
            <input placeholder="State code e.g. 23 (MP)" className="border p-2 rounded" value={customer.stateCode} onChange={e=>setCustomer({...customer, stateCode: e.target.value})} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex gap-2 items-center mb-4">
            <button onClick={()=>setTab("games")} className={`px-4 py-1.5 rounded-full text-sm font-bold ${tab==="games" ? "bg-teal-600 text-white" : "bg-gray-100"}`}>GAMES</button>
            <button onClick={()=>setTab("packages")} className={`px-4 py-1.5 rounded-full text-sm font-bold ${tab==="packages" ? "bg-teal-600 text-white" : "bg-gray-100"}`}>PACKAGES</button>
            <input placeholder="Search..." className="ml-auto border p-1.5 rounded-full px-3 text-sm w-48" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-auto">
            {list.map(it => (
              <div key={it._id} className="flex justify-between items-center border p-2 rounded hover:bg-gray-50">
                <div><div className="font-medium">{it.name}</div><div className="text-xs text-gray-500">₹{it.price || it.rate}</div></div>
                <button onClick={()=>addToCart(it)} className="bg-orange-500 text-white w-7 h-7 rounded-full">+</button>
              </div>
            ))}
            {list.length===0 && <div className="col-span-2 text-center py-10 text-gray-400">No {tab} found</div>}
          </div>
        </div>
      </div>

      {/* RIGHT - Bill Summary */}
      <div className="col-span-4 bg-white p-4 rounded-xl shadow h-fit sticky top-4">
        <h3 className="font-bold flex justify-between">Bill Summary <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cart.length} items</span></h3>
        <div className="mt-4 space-y-2 max-h-[200px] overflow-auto">
          {cart.map((c,i)=>(
            <div key={i} className="flex justify-between text-sm"><span>{c.name} x{c.qty}</span><span>₹{c.price*c.qty}</span></div>
          ))}
          {cart.length===0 && <div className="text-center text-gray-400 py-8">Add games or packages</div>}
        </div>
        <div className="border-t mt-4 pt-3 text-sm space-y-2">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Discount {discountType}</span><span>-₹{discountAmt}</span></div>
          <div className="flex justify-between font-bold"><span>GST {gstEnabled ? "18%" : "0% OFF"}</span><span>₹{gstAmt.toFixed(0)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
        </div>
        <div className="mt-4">
          <div className="flex gap-2 mb-2">
            <button onClick={()=>setDiscountType("%")} className={`flex-1 py-2 rounded-lg font-bold ${discountType==="%"?"bg-orange-500 text-white":"bg-gray-100"}`}>% %</button>
            <button onClick={()=>setDiscountType("Flat")} className={`flex-1 py-2 rounded-lg font-bold ${discountType==="Flat"?"bg-orange-500 text-white":"bg-gray-100"}`}>₹ Flat</button>
          </div>
          <input type="number" value={discountVal} onChange={e=>setDiscountVal(Number(e.target.value))} className="w-full border p-2 rounded mb-3" placeholder="Discount" />
        </div>
        <button onClick={createBill} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2">Create Bill - ₹{total.toFixed(0)}</button>
      </div>
    </div>
  );
}