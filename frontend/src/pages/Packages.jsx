import { useEffect, useState, useMemo } from "react";
import api from "../api";
export default function Packages() {
  const [allItems, setAllItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pax, setPax] = useState(1);
  const [offer, setOffer] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [showList, setShowList] = useState(true);
  const [search, setSearch] = useState("");
  const fetchData = async () => {
    try {
      const res = await api.get("/games");
      const d = res.data?.data || res.data || [];
      setAllItems(Array.isArray(d)?d:[]);
    } catch(e){}
    api.get("/packages").then(r=>{ setPackages(r.data?.data||r.data||[]); });
  };
  useEffect(()=>{fetchData();},[]);
  const filtered = useMemo(()=> allItems.filter(i=>!search || i.name?.toLowerCase().includes(search.toLowerCase())), [allItems, search]);
  const total = selected.reduce((s,it)=> s + Number(it.price||0),0);
  const finalCalc = finalPrice!==""? Number(finalPrice) : Math.max(0, total - (Number(offer)||0));
  const toggle = (it)=>{ const id=it._id||it.id; setSelected(p=>{ const ex=p.find(x=>(x._id||x.id)===id); if(ex) return p.filter(x=>(x._id||x.id)!==id); return [...p,it]; }); };
  const save = async ()=>{
    if(!name.trim()) return alert("Name daalo");
    if(selected.length===0) return alert("1 item select karo");
    const payload={ name:name.trim(), items:selected.map(i=>i._id||i.id), pax:Number(pax)||1, offerPrice:Number(offer)||0, finalPrice:finalCalc, totalPrice:total };
    try{ if(editId) await api.put(`/packages/${editId}`,payload); else await api.post("/packages",payload); setName(""); setSelected([]); setShowList(true); fetchData(); }catch(e){alert("Error");}
  };
  return (
    <div className="p-6 min-h-screen bg-[#faf7f2]">
      <div className="flex justify-between mb-6"><h1 className="text-3xl font-black">Packages ({packages.length})</h1><button onClick={()=>setShowList(!showList)} className="bg-black text-white px-6 py-2.5 rounded-full font-bold">{showList?"+ Add Package":"View All"}</button></div>
      {showList? <div className="grid grid-cols-3 gap-5">{packages.length===0 && <div className="col-span-3 bg-white p-16 rounded-[30px] text-center border-2 border-dashed flex flex-col items-center"><div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-7xl mx-auto mb-6 shadow-2xl">📦</div><h2 className="text-2xl font-black">No Packages</h2><button onClick={()=>setShowList(false)} className="mt-6 bg-black text-white px-8 py-3 rounded-full font-bold">+ Create Package</button></div>}{packages.map(p=><div key={p._id} className="bg-white p-5 rounded-[20px] border"><h3 className="font-black">{p.name}</h3><div className="font-black text-green-600 text-2xl">₹{p.finalPrice}</div></div>)}</div>
      : <div className="flex gap-6"><div className="flex-1"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Items / Activities..." className="w-full bg-white border px-5 py-3 rounded-full mb-4"/><div className="grid grid-cols-3 gap-3">{filtered.map(it=>{ const id=it._id||it.id; const sel=selected.find(s=>(s._id||s.id)===id); return <div key={id} onClick={()=>toggle(it)} className={`p-4 rounded-[18px] border-2 cursor-pointer ${sel?"bg-orange-500 text-white":"bg-white"}`}><div className="font-bold text-sm">{it.name}</div><div className="font-black mt-2">₹{it.price||0}</div></div>})}</div></div>
      <div className="w-[400px]"><div className="bg-white p-8 rounded-[32px] shadow-2xl border sticky top-6"><div className="flex justify-center mb-6"><div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-7xl shadow-2xl mx-auto">📦</div></div><h2 className="text-center font-black text-3xl">New Package</h2><p className="text-center text-xs opacity-40 mb-6">BADA ICON BICH ME - ITEMS SE</p><input value={name} onChange={e=>setName(e.target.value)} placeholder="Package Name *" className="w-full border-2 px-5 py-3 rounded-full mb-3 font-bold"/><div className="flex gap-3 mb-3"><input type="number" value={pax} onChange={e=>setPax(e.target.value)} className="w-1/2 border-2 px-4 py-3 rounded-full" placeholder="Pax"/><input type="number" value={offer} onChange={e=>setOffer(e.target.value)} className="w-1/2 border-2 px-4 py-3 rounded-full" placeholder="Offer"/></div><input type="number" value={finalPrice} onChange={e=>setFinalPrice(e.target.value)} placeholder={String(finalCalc)} className="w-full border-[3px] border-black px-5 py-4 rounded-full mb-4 font-black text-xl text-center"/><button onClick={save} className="w-full bg-black text-white py-4 rounded-full font-black text-lg">Create ₹{finalPrice!==""?finalPrice:finalCalc}</button></div></div></div>}
    </div>
  );
}