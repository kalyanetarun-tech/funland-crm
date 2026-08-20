import { useState } from 'react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-08-11', type: 'Expense', category: 'Staff Payment', to: 'Raju - Activity Staff', amount: 1500, work: 'Duty', method: 'Cash' },
    { id: 2, date: '2026-08-11', type: 'Expense', category: 'Maintenance', to: 'Electrician', amount: 800, work: 'Lights repair', method: 'Cash' },
    { id: 3, date: '2026-08-11', type: 'Income', category: 'Sales', to: 'Bills Auto', amount: 1743, work: '11 Bills', method: 'Online' },
  ]);

  const [form, setForm] = useState({ category: 'Staff Payment', to: '', amount: '', work: '', method: 'Cash', type: 'Expense' });

  const add = () => {
    if (!form.amount || !form.to) return alert('Amount aur Kisko diya bharo');
    setExpenses([{ id: Date.now(), date: new Date().toISOString().slice(0, 10), ...form, amount: parseFloat(form.amount) }, ...expenses]);
    setForm({ category: 'Staff Payment', to: '', amount: '', work: '', method: 'Cash', type: 'Expense' });
  };

  const income = expenses.filter(e => e.type === 'Income').reduce((s, e) => s + e.amount, 0);
  const expenseTotal = expenses.filter(e => e.type === 'Expense').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Expenses & Income</h1>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-sm text-green-600">Income</div>
          <div className="text-xl font-bold text-green-700">₹{income}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-sm text-red-600">Expense</div>
          <div className="text-xl font-bold text-red-700">₹{expenseTotal}</div>
        </div>
        <div className="bg-black text-white rounded-xl p-4">
          <div className="text-sm opacity-70">Balance</div>
          <div className="text-xl font-bold">₹{income - expenseTotal}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2">
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input placeholder="Kisko / From" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input placeholder="Work / Note" value={form.work} onChange={e => setForm({ ...form, work: e.target.value })} className="border rounded-lg px-3 py-2" />
          <button onClick={add} className="bg-black text-white rounded-lg px-4 py-2 font-semibold">Add</button>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">To</th><th className="p-3 text-left">Work</th><th className="p-3 text-right">Amount</th></tr>
          </thead>
          <tbody>
            {expenses.map(ex => (
              <tr key={ex.id} className="border-t">
                <td className="p-3">{ex.date}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${ex.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ex.type}</span></td>
                <td className="p-3">{ex.to}</td>
                <td className="p-3">{ex.work}</td>
                <td className="p-3 text-right font-bold">₹{ex.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
