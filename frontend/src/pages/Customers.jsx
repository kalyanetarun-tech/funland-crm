import { useEffect, useState } from "react"

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [sortBy, setSortBy] = useState("spent")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/customers").then(r=>r.json()).then(setCustomers).catch(()=>setCustomers([]))
  }, [])

  const list = [...customers]
    .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
    .sort((a,b) => {
      if(sortBy==="spent") return (b.totalSpent||0) - (a.totalSpent||0)
      if(sortBy==="visits") return (b.visits||0) - (a.visits||0)
      if(sortBy==="recent") return new Date(b.lastVisit||0) - new Date(a.lastVisit||0)
      return (a.name||"").localeCompare(b.name||"")
    })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Customers</h1>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border rounded-full px-3 py-1">
          <option value="spent">Most Spent High to Low</option>
          <option value="visits">Most Visits</option>
          <option value="recent">Recent Visit</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name/phone" className="border w-full p-2 rounded-xl mt-3" />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {list.map(c=>(
          <div key={c.phone} className="border rounded-2xl p-4 bg-white">
            <b>{c.name}</b><div className="text-sm text-gray-500">{c.phone}</div>
            <div className="flex justify-between mt-2 bg-orange-50 p-2 rounded-xl">
              <span>VISITS {c.visits}</span><span className="font-bold text-orange-600">Rs. {c.totalSpent}</span>
            </div>
            <div className="text-xs mt-1">Last: {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-IN') : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}