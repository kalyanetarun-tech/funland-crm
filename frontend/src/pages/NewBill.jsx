import React, { useEffect, useState } from "react";
import { api, fmtErr, inr } from "@/lib/api";
import { PageHead } from "@/components/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function NewVisit() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("item");
  const [gstEnabled, setGstEnabled] = useState(false); // AUTO OFF
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/items").then(r=> setItems(r.data)).catch(()=> setItems([
      { id:1, name:"Aachari Tikka", price:170, category:"item", gst_percent:18 },
      { id:2, name:"Aloo Bada", price:25, category:"item", gst_percent:18 },
      { id:3, name:"Bungee Jump", price:300, category:"activity", gst_percent:18 },
      { id:4, name:"Zipline", price:250, category:"activity", gst_percent:18 },
      { id:5, name:"Family Package", price:1500, category:"package", gst_percent:18 },
    ]));
  }, []);

  const filtered = items.filter(it => {
    const matchTab = activeTab === "item" ? (it.category === "item" || it.category === "Food & Activities") : it.category === activeTab;
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const addToCart = (it) => {
    const exist = cart.find(c=> c.id === it.id);
    if(exist) setCart(cart.map(c=> c.id === it.id ? {...c, qty: c.qty+1} : c));
    else setCart([...cart, {...it, qty:1, category: it.category === "item" ? "Food & Activities" : it.category }]);
  };

  const subtotal = cart.reduce((s,it)=> s + it.price * it.qty, 0);
  const gstTotal = gstEnabled ? cart.reduce((s,it)=> s + (it.price * it.qty * (it.gst_percent||0)/100),0) : 0;
  const total = subtotal - discount + gstTotal;

  const createBill = async () => {
    if(!customerName || !phone) { toast.error("Customer name aur phone daalo"); return; }
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: phone,
        items: cart.map(c=> ({ name: c.name, qty: c.qty, price: c.price, gst_percent: gstEnabled ? c.gst_percent : 0, category: c.category })),
        discount: Number(discount),
        gst_enabled: gstEnabled,
        payment_status: "pending"
      };
      const { data } = await api.post("/bills", payload);
      toast.success("Bill created");
      navigate(`/bills/${data.id || data.bill_id || data._id}`);
    } catch(e){ toast.error(fmtErr(e)); }
  };

  return (
    <div>
      <PageHead title="New Bill" subtitle="Customer details aur Food & Activities select karo" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold">Customer Details</div>
              <div className="flex items-center gap-2 border px-3 py-1 rounded-full">
                <Label className="text-xs font-bold">GST 18% {gstEnabled ? "ON" : "OFF"} (Tick to Enable)</Label>
                <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer Name" /></div>
              <div><Label>Phone *</Label><Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile No" /></div>
            </div>
            {!gstEnabled && <div className="text-[11px] mt-3 bg-gray-50 p-2 rounded">GST off hai - tick karoge tabhi bill me GST ayega</div>}
          </Card>

          <Card className="p-5 rounded-2xl">
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setActiveTab("item")} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab==="item" ? "bg-[#0a6b64] text-white" : "bg-gray-100"}`}>FOOD & ACTIVITIES</button>
              <button onClick={()=>setActiveTab("package")} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab==="package" ? "bg-[#0a6b64] text-white" : "bg-gray-100"}`}>PACKAGES</button>
              <Input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="ml-auto max-w-[200px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map(it=> (
                <div key={it.id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div><div className="font-bold text-sm">{it.name}</div><div className="text-xs text-gray-500">₹{it.price}</div></div>
                  <button onClick={()=>addToCart(it)} className="bg-[#ff5a1f] text-white w-7 h-7 rounded-full font-bold">+</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 rounded-2xl h-fit">
          <div className="font-bold mb-3">Bill Summary - {cart.length} items</div>
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {cart.map((c,i)=> (
              <div key={i} className="flex justify-between text-sm"><span>{c.name} x {c.qty}</span><span>₹{c.price * c.qty}</span></div>
            ))}
          </div>
          <div className="border-t mt-4 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {gstEnabled && <div className="flex justify-between"><span>GST 18%</span><span>{inr(gstTotal)}</span></div>}
            <div className="flex justify-between items-center"><span>Discount</span><Input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} className="w-20 h-7" /></div>
            <div className="flex justify-between font-black text-lg pt-2 border-t"><span>Total</span><span className="text-[#ff5a1f]">{inr(total)}</span></div>
          </div>
          <Button onClick={createBill} className="w-full mt-4 rounded-full bg-black text-white h-11 font-bold">Create Bill - ₹{total}</Button>
        </Card>
      </div>
    </div>
  );
}