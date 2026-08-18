import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function NewVisit() {
  const nav = useNavigate();
  const [tab, setTab] = useState("food"); // food = Food & Activities
  const [foodItems, setFoodItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false); // AUTO OFF as you asked
  const [discountType, setDiscountType] = useState("%");
  const [discountVal, setDiscountVal] = useState(0);
  const [customer, setCustomer] = useState({
    name: "", phone: "", email: "", gstin: "", stateCode: "23"
  });

  useEffect(() => {
    api.get("/games").then(r => setFoodItems(r.data.data || r.data || [])).catch(()=>{});
    api.get("/items").then(r => {
      const d = r.data.data || r.data || [];
      if(d.length) setFoodItems(d);
    }).catch(()=>{});
    api.get("/packages").then(r => setPackages(r.data.data || r.data || [])).catch(()=>{});
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(p => p._id === item._id);
      if(ex) return prev.map(p => p._id === item._id ? {...p, qty: p.qty+1} : p);
      return [...prev, {...item, qty: 1, price: item.price || item.rate || 0}];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p._id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discountType === "%" ? (subtotal * Number(discountVal||0))/100 : Number(discountVal||0);
  const afterDisc = Math.max(0, subtotal - discountAmt);
  const gstAmt = gstEnabled ? (afterDisc * 18)/100 : 0;
  const total = afterDisc + gstAmt;

  const createBill = async () => {
    if(!customer.name || !customer.phone) return alert("Name aur Phone bharna zaruri hai!");
    if(cart.length===0) return alert("Kam se kam 1 item add karo!");
    try{
      // Create customer first
      let custId;
      try{
        const res = await api.post("/customers", customer);
        custId = res.data._id || res.data.data?._id;
      }catch(e){
        const res = await api.get(`/customers?search=${customer.phone}`);
        const arr = res.data.data || res.data || [];
        if(arr.length) custId = arr[0]._id;
        else throw e;
      }

      const billRes = await api.post("/bills", {
        customer: custId,
        customerDetails: customer,
        items: cart.map(c=>({ id: c._id, name: c.name, price: c.price, qty: c.qty })),
        subtotal, discount: discountAmt, gst: gstAmt, total, gstEnabled,
        status: "Unpaid"
      });
      const billId = billRes.data._id || billRes.data.data?._id;
      // DIRECT GO TO BILL PAYMENT PAGE
      nav(`/bills/${billId}?pay=1`);
    }catch(err){
      console.error(err);
      alert("Bill create me error: " + (err.response?.data?.message || err.message));
    }
  };

  const list = (tab === "food" ? foodItems : packages).filter(g => 
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 grid grid-cols-12 gap-4 bg-[#faf8f5] min-h-screen">
      <div className="col-span-8 space-y-4">
        {/* CUSTOMER */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] tracking-[0.2em] text-gray-400 font-bold">CUSTOMER DETAILS</h3>
            <label className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shadow-sm">
              <input type="checkbox" checked={gstEnabled} onChange={e=>setGstEnabled(e.target.checked)} className="accent-orange-600" />
              {gstEnabled ? "GST 18% ON" : "GST OFF (Tick to Enable)"}
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name*" className="border border-gray-200 p-2.5 rounded-xl text-sm" value={customer.name} onChange={e=>setCustomer({...customer, name: e.target.value})} />
            <input placeholder="Phone*" className="border border-gray-200 p-2.5 rounded-xl text-sm" value={customer.phone} onChange={e=>setCustomer({...customer, phone: e.target.value})} />
            <input placeholder="Email (optional)" className="border border-gray-200 p-2.5 rounded-xl text-sm" value={customer.email} onChange={e=>setCustomer({...customer, email: e.target.value})} />
            <input placeholder="Customer GSTIN (optional - B2B tax invoice ke liye)" className="border border-gray-200 p-2.5 rounded-xl text-sm col-span-2" value={customer.gstin} onChange={e=>setCustomer({...customer, gstin: e.target.value})} />
            <input placeholder="State - Madhya Pradesh (23)" className="border border-gray-200 p-2.5 rounded-xl text-sm" value={customer.stateCode} onChange={e=>setCustomer({...customer, stateCode: e.target.value})} />
          </div>
        </div>

        {/* ITEMS */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <div className="flex gap-3 items-center mb-4">
            <button onClick={()=>setTab("food")} className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider ${tab==="food" ? "bg-[#0a6b64] text-white" : "bg-gray-100 text-gray-500"}`}>FOOD & ACTIVITIES</button>
            <button onClick={()=>setTab("packages")} className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider ${tab==="packages" ? "bg-[#0a6b64] text-white" : "bg-gray-100 text-gray-500"}`}>PACKAGES</button>
            <input placeholder="Search..." className="ml-auto border border-gray-200 p-2 rounded-full px-4 text-xs w-56" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-auto pr-1">
            {list.map(it => (
              <div key={it._id} className="flex justify-between items-center border border-gray-100 p-3 rounded-xl hover:bg-orange-50/50">
                <div><div className="font-semibold text-sm">{it.name}</div><div className="text-[11px] text-gray-500">₹{it.price || it.rate || 0}</div></div>
                <button onClick={()=>addToCart(it)} className="bg-[#ff5a1f] hover:bg-orange-600 text-white w-8 h-8 rounded-full text-lg leading-none">+</button>
              </div>
            ))}
            {list.length===0 && <div className="col-span-2 text-center py-16 text-gray-400 text-sm">No items found. Add items in Items / Activities</div>}
          </div>
        </div>
      </div>

      {/* BILL SUMMARY */}
      <div className="col-span-4 bg-white p-5 rounded-2xl shadow-sm border h-fit sticky top-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm">Bill Summary</h3>
          <span className="text-[10px] bg-gray-100 px-2.5 py-1 rounded-full font-bold">{cart.length} Items</span>
        </div>

        <div className="mt-5 space-y-2.5 max-h-[220px] overflow-auto">
          {cart.map((c,i)=>(
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="truncate w-[70%]">{c.name} <b className="text-gray-500">x{c.qty}</b></span>
              <div className="flex items-center gap-2">
                <span className="font-medium">₹{c.price*c.qty}</span>
                <button onClick={()=>removeFromCart(c._id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
              </div>
            </div>
          ))}
          {cart.length===0 && <div className="text-center text-gray-400 py-10 text-sm">Add Food & Activities</div>}
        </div>

        {/* ONLY SHOW BILL BREAKUP WHEN NEEDED */}
        <div className="border-t mt-5 pt-4 text-[13px] space-y-2.5">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between text-gray-600"><span>Discount {discountType === "%" ? `(${discountVal}%)` : ""}</span><span>-₹{discountAmt.toFixed(0)}</span></div>
          
          {gstEnabled && (
            <div className="flex justify-between font-semibold text-orange-600"><span>GST 18%</span><span>₹{gstAmt.toFixed(0)}</span></div>
          )}

          <div className="flex justify-between text-[16px] font-bold border-t pt-3 mt-2"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
          {!gstEnabled && <div className="text-[10px] text-gray-400">GST off hai - tick karoge tabhi bill me GST ayega</div>}
        </div>

        <div className="mt-5">
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setDiscountType("%")} className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wider ${discountType==="%"?"bg-[#ff5a1f] text-white":"bg-gray-100"}`}>% %</button>
            <button onClick={()=>setDiscountType("Flat")} className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wider ${discountType==="Flat"?"bg-[#ff5a1f] text-white":"bg-gray-100"}`}>₹ Flat</button>
          </div>
          <input type="number" value={discountVal} onChange={e=>setDiscountVal(e.target.value)} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" placeholder="Discount value" />
        </div>

        <button onClick={createBill} className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold mt-5 text-sm tracking-wider">Create Bill - ₹{total.toFixed(0)}</button>
      </div>
    </div>
  );
}