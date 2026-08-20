import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import PaymentModal from "./PaymentModal";
import { toast } from "sonner";

export default function NewVisit(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [tab, setTab] = useState("items");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [showPay, setShowPay] = useState(false);

  useEffect(()=>{
    api.get("/food-items").then(r=>setItems(r.data?.data||r.data||[])).catch(()=> api.get("/items").then(r=>setItems(r.data?.data||r.data||[])).catch(()=>{}));
    api.get("/packages").then(r=>setPackages(r.data?.data||r.data||[])).catch(()=>{});
  },[]);

  const addToCart = (it) => {
    const price = Number(it.price||it.rate||it.amount||0);
    setCart(prev=>{
      const id = it._id||it.id||it.name;
      const f = prev.find(p=> (p._id||p.name)===id || p.name===it.name);
      if(f) return prev.map(p=> p._id===f._id? {...p, qty:p.qty+1}:p);
      return [...prev, { _id:id, name:it.name, price, gst_percent: it.gst_percent||5, qty:1, category: it.category }];
    });
    toast.success(it.name+" added");
  };

  const subtotal = cart.reduce((s,c)=> s + c.price*c.qty, 0);
  const discountAmt = Number(discount)||0;
  const gstTotal = gstEnabled? cart.reduce((s,c)=> s + (c.price*c.qty * (Number(c.gst_percent)||5)/100), 0) : 0;
  const total = Math.max(0, subtotal - discountAmt + gstTotal);

  const finalCreateBill = async (method) => {
    try{
      const payload = { customer_name:customerName, customer_phone:phone, items: cart.map(c=>({ name:c.name, qty:c.qty, price:c.price, total:c.price*c.qty, gst_percent: gstEnabled? c.gst_percent:0 })), subtotal, discount:discountAmt, gst_total:gstTotal, total, gst_enabled:gstEnabled, payment_method:method, payment_status:"paid", status:"Paid" };
      const res = await api.post("/bills", payload);
      const d=res.data||{}; const newId=d.id||d._id||d.bill_id||d.bill?.id||d.data?.id;
      try{ await api.put(`/bills/${newId}/pay`, { status:"paid", method }); }catch(e){}
      setShowPay(false); toast.success("Paid "+method); navigate(`/bills/${newId}?pay=1`);
    }catch(e){ toast.error(e.response?.data?.detail||e.message); }
  };

  const raw = tab==="items"? items : packages;
  const cats = ["All","Activities","Beverage","Dress","Entry","Food","Others","Rooms"];
  const counts = {};
  cats.forEach(c=> counts[c]=0);
  raw.forEach(i=>{
    const c = (i.category||"Others");
    const key = cats.find(k=> k.toLowerCase()===c.toLowerCase()) || "Others";
    counts[key]++; counts["All"]++;
  });

  const filtered = raw.filter(i=>{
    const bySearch = (i.name||"").toLowerCase().includes(search.toLowerCase());
    const byCat = selectedCat==="All" || (i.category||"Others").toLowerCase()===selectedCat.toLowerCase();
    return bySearch && byCat;
  });

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl p-4">
          <div className="flex gap-2 mb-4">
            <button onClick={()=>setTab("items")} className={`px-4 py-2 rounded-full font-bold ${tab==="items"?"bg-black text-white":"border"}`}>Items / Activities</button>
            <button onClick={()=>setTab("packages")} className={`px-4 py-2 rounded-full font-bold ${tab==="packages"?"bg-black text-white":"border"}`}>Packages</button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items by name..." className="border rounded-full px-4 py-2 text-sm ml-auto w-64"/>
          </div>
          <div className="flex gap-2 overflow-auto pb-3 mb-4">
            {cats.map(c=>(
              <button key={c} onClick={()=>setSelectedCat(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedCat===c?"bg-black text-white":"bg-gray-100"}`}>
                {c} ({counts[c]||0})
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-auto">
            {filtered.map(it=>(
              <div key={it._id||it.id||it.name} onClick={()=>addToCart(it)} className="border rounded-xl p-4 cursor-pointer hover:border-black bg-[#fdfbf7]">
                <div className="font-bold">{it.name}</div>
                <div className="text-[10px] bg-blue-50 text-blue-600 inline-block px-2 py-0.5 rounded-full mt-1">{(it.category||"FOOD").toUpperCase()}</div>
                <div className="font-bold mt-3">₹{it.price||it.rate||it.amount}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow h-fit sticky top-4">
          <input placeholder="Customer Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full border rounded-full px-4 py-2 mb-2 text-sm"/>
          <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded-full px-4 py-2 mb-3 text-sm"/>
          <div className="space-y-1 max-h-[25vh] overflow-auto mb-3">
            {cart.map(c=>(<div key={c._id} className="flex justify-between text-sm py-1 border-b"><span>{c.name} x{c.qty}</span><span>₹{c.price*c.qty}</span></div>))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
              <span className="font-bold text-xs">GST {gstEnabled?"ON":"OFF"}</span>
              <button onClick={()=>setGstEnabled(!gstEnabled)} className={`w-10 h-5 rounded-full ${gstEnabled?"bg-black":"bg-gray-300"} relative`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${gstEnabled?"left-5":"left-0.5"}`}></span></button>
            </div>
            <input placeholder="Discount ₹" type="number" value={discount} onChange={e=>setDiscount(e.target.value)} className="w-full border rounded-full px-3 py-1.5 text-sm"/>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          </div>
          {showPay && <PaymentModal total={total} onClose={()=>setShowPay(false)} onConfirm={finalCreateBill} />}
          <button onClick={()=>{ if(!customerName) return toast.error("Name daalo"); if(cart.length===0) return toast.error("Item add karo"); setShowPay(true); }} className="w-full mt-4 bg-black text-white py-3 rounded-full font-bold text-sm">Pay - ₹{total.toFixed(2)}</button>
        </div>
      </div>
    </div>
  );
}
