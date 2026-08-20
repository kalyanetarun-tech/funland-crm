import { useState, useEffect } from 'react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    {id:1, date:'2026-08-11', type:'Expense', category:'Staff Payment', to:'Raju - Activity Staff', amount:1500, work:'Week Salary', method:'UPI'},
    {id:2, date:'2026-08-11', type:'Expense', category:'Maintenance', to:'Electrician', amount:800, work:'Lights repair', method:'Cash'},
    {id:3, date:'2026-08-11', type:'Income', category:'Sales', to:'Bills Auto', amount:1743, work:'11 Bills', method:'Auto'},
  ]);
  const [form, setForm] = useState({category:'Staff Payment', to:'', amount:'', work:'', method:'Cash', type:'Expense'});

  const add = () => {
    if(!form.amount || !form.to) return alert('Amount aur Kisko diya bharo');
    setExpenses([{id:Date.now(), date:new Date().toISOString().slice(0,10), ...form, amount: parseFloat(form.amount)}, ...expenses]);
    setForm({category:'Staff Payment', to:'', amount:'', work:'', method:'Cash', type:'Expense'});
  };

  const income = expenses.filter(e=>e.type==='Income').reduce((s,e)=>s+e.amount,0);
  const out = expenses.filter(e=>e.type==='Expense').reduce((s,e)=>s+e.amount,0);
  const profit = income - out;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Expenses - Aaj ka Hisaab</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4"><p className="text-sm text-green-700">Aaj Aaya</p><p className="text-2xl font-bold text-green-800">₹{income}</p></div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"><p className="text-sm text-red-700">Aaj Kharcha</p><p className="text-2xl font-bold text-red-800">₹{out}</p></div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4"><p className="text-sm text-blue-700">Profit</p><p className="text-2xl font-bold text-blue-800">₹{profit}</p><p className="text-xs">{profit>0?'Profit me ho':'Loss me'}</p></div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 border">
        <h3 className="font-bold mb-3">Naya Kharcha / Payment Add Karo</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="border rounded-xl p-2"><option>Expense</option><option>Income</option></select>
          <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="border rounded-xl p-2">
            <option>Staff Payment</option><option>Maintenance</option><option>Food Cost</option><option>Electricity</option><option>Vendor Payment</option><option>Other</option><option>Sales</option>
          </select>
          <input placeholder="Kisko Diya? (Raju, Light wale)" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} className="border rounded-xl p-2"/>
          <input placeholder="Kitna? ₹" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="border rounded-xl p-2"/>
          <input placeholder="Kaam kya tha?" value={form.work} onChange={e=>setForm({...form,work:e.target.value})} className="border rounded-xl p-2"/>
          <select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} className="border rounded-xl p-2"><option>Cash</option><option>UPI</option><option>Bank</option></select>
        </div>
        <button onClick={add} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-bold">Add Karo</button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-3 text-left">Date</th><th>Type</th><th>Category</th><th>Kisko</th><th>Kaam</th><th>Amount</th><th>Method</th></tr></thead>
          <tbody>{expenses.map(r=><tr key={r.id} className="border-t"><td className="p-3">{r.date}</td><td className={r.type==='Income'?'text-green-600':'text-red-600'}>{r.type}</td><td>{r.category}</td><td>{r.to}</td><td>{r.work}</td><td className="font-bold">₹{r.amount}</td><td>{r.method}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Note: Ye data Reports > Profit/Loss me auto jud jayega. Bills se Income auto aayega.</p>
    </div>
  );
}
