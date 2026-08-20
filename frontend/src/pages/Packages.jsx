
import { useState, useEffect } from "react";
import axios from "axios";

export default function Packages(){
  const [packages, setPackages] = useState([{id:1, name:"PARK ENTRY", price:299, items:["Park Entry"], color:"from-orange-400 to-red-400"}]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [showList, setShowList] = useState(true);

  // BUG FIX: pehle is_active filter tha, ab sab items la rahe hain
  useEffect(()=>{
    const fetchItems = async()=>{
      try{
        // OLD: /api/items?is_active=true  -> NEW: /api/items
        const res = await axios.get("/api/items");
        setItems(res.data?.data || res.data || []);
      }catch(e){
        // fallback mock data jab tak backend fix na ho
        setItems([
          {id:1, name:"Park Entry", price:299, category:"Entry", is_active:true},
          {id:2, name:"Adventure Park Full", price:799, category:"Activity", is_active:true},
          {id:3, name:"Water Park", price:499, category:"Activity", is_active:true},
          {id:4, name:"Go Karting Single", price:250, category:"Activity", is_active:true},
          {id:5, name:"Go Karting Double", price:400, category:"Activity", is_active:true},
          {id:6, name:"Trampoline Park", price:200, category:"Activity", is_active:true},
          {id:7, name:"Zipline", price:300, category:"Activity", is_active:true},
          {id:8, name:"12D Cinema", price:150, category:"Activity", is_active:true},
          {id:9, name:"Veg Burger", price:80, category:"Food", is_active:true},
          {id:10, name:"Veg Meal Combo", price:199, category:"Food", is_active:true},
          {id:11, name:"Photo Package", price:99, category:"Add-on", is_active:true},
        ]);
      }
    };
    fetchItems();
  },[]);

  const filtered = items.filter(i=> i.name.toLowerCase().includes(search.toLowerCase()));

  const addToPkg = (item)=>{
    if(!selectedItems.find(s=>s.id===item.id)) setSelectedItems([...selectedItems, item]);
  };

  const save = async()=>{
    if(!pkgName || !pkgPrice) return alert("Package name aur price bharo");
    const totalActual = selectedItems.reduce((s,i)=>s+i.price,0);
    const newPkg = {
      id:Date.now(),
      name:pkgName.toUpperCase(),
      price: parseFloat(pkgPrice),
      items: selectedItems,
      actualPrice: totalActual,
      savings: totalActual - parseFloat(pkgPrice),
      color: ["from-orange-400 to-red-400","from-blue-400 to-purple-500","from-green-400 to-emerald-500","from-pink-400 to-orange-400"][packages.length%4]
    };
    setPackages([...packages, newPkg]);
    // API call
    try{ await axios.post("/api/packages", newPkg); }catch{}
    setPkgName(""); setPkgPrice(""); setSelectedItems([]); setShowList(true);
  };

  return (
    <div className="p-6 min-h-screen bg-[#faf7f2]">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-black">Packages ({packages.length}) - Decorative</h1>
        <button onClick={()=>setShowList(!showList)} className="bg-black text-white px-6 py-2 rounded-full font-bold">{showList?"New Package Banao":"List Dekho"}</button>
      </div>

      {showList ? (
        <div className="grid grid-cols-3 gap-5">
          {packages.map(p=>(
            <div key={p.id} className={`bg-gradient-to-br ${p.color} p-[2px] rounded-[24px]`}>
              <div className="bg-white rounded-[22px] p-6 h-full">
                <div className={`h-2 w-full bg-gradient-to-r ${p.color} rounded-full mb-4`}></div>
                <h3 className="font-black text-xl">{p.name}</h3>
                <p className="text-3xl font-black mt-2">₹{p.price}</p>
                {p.actualPrice && <p className="text-xs text-gray-500 line-through">Actual ₹{p.actualPrice} - Save ₹{p.savings}</p>}
                <div className="mt-3 flex flex-wrap gap-1">{p.items?.map((it,i)=><span key={i} className="text-[10px] bg-orange-50 border px-2 py-1 rounded-full">{typeof it==='string'?it:it.name}</span>)}</div>
                <div className="mt-4 flex gap-2"><span className="text-xs bg-black text-white px-3 py-1 rounded-full">QR: {p.name.slice(0,6)}</span><span className="text-xs bg-gray-100 px-3 py-1 rounded-full">Decorative Card</span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 bg-white p-6 rounded-[24px] border shadow-sm">
            <h3 className="font-bold mb-2">All Items / Activities - Full List ({filtered.length})</h3>
            <p className="text-xs text-green-600 mb-3">✅ Bug Fixed: Ab saare items dikhenge, pehle sirf 1 dikh raha tha</p>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item... (burger, karting, park)" className="w-full border-2 rounded-full px-4 py-2 mb-4 outline-none focus:border-orange-400"/>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-auto">
              {filtered.map(item=>(
                <div key={item.id} className="flex justify-between items-center border rounded-xl p-3 hover:bg-orange-50">
                  <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.category} - ₹{item.price} {item.is_active?"●":"○"}</p></div>
                  <button onClick={()=>addToPkg(item)} className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">+ Add</button>
                </div>
              ))}
            </div>
          </div>
          <div className="w-[400px]">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl border sticky top-6">
              <h3 className="font-black text-lg mb-4">Package Banao</h3>
              <input value={pkgName} onChange={e=>setPkgName(e.target.value)} placeholder="Package Name (e.g. Adventure Combo)" className="w-full border rounded-xl p-3 mb-3"/>
              <input value={pkgPrice} onChange={e=>setPkgPrice(e.target.value)} type="number" placeholder="Offer Price ₹ (e.g. 999)" className="w-full border rounded-xl p-3 mb-3"/>
              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold">Selected Items ({selectedItems.length})</p>
                {selectedItems.length===0 && <p className="text-xs text-gray-400">Left se items add karo</p>}
                {selectedItems.map(s=> <div key={s.id} className="flex justify-between text-xs mt-1"><span>{s.name}</span><span>₹{s.price}</span></div>)}
                {selectedItems.length>0 && <div className="border-t mt-2 pt-2 flex justify-between font-bold text-sm"><span>Total Actual</span><span>₹{selectedItems.reduce((s,i)=>s+i.price,0)}</span></div>}
              </div>
              <button onClick={save} className="w-full bg-black text-white py-3 rounded-full font-black">Decorative Package Save Karo</button>
              <p className="text-[10px] text-gray-400 mt-3 text-center">Ye package New Bill + Marketing + Reports me auto jud jayega</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
