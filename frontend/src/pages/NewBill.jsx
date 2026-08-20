import { useEffect, useState } from 'react'
import api, { fmtErr, inr } from '@/lib/api'

// QR image ko public me daalna - /funland-qr.png
const QR_IMAGE = '/funland-qr.png'

export default function NewBill() {
  const [items, setItems] = useState([])
  const [packages, setPackages] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('items') // items | packages
  const [showPay, setShowPay] = useState(false)
  const [payMode, setPayMode] = useState('')
  const [loading, setLoading] = useState(false)

  // Load items from Items/Activities page API - kuch miss na ho
  useEffect(() => {
    const load = async () => {
      try {
        const res1 = await api.get('/items')
        setItems(res1.data?.data || res1.data || [])
      } catch (e) {
        // fallback
        try {
          const res = await api.get('/api/items')
          setItems(res.data?.data || res.data || [])
        } catch {}
      }
      try {
        const res2 = await api.get('/packages')
        setPackages(res2.data?.data || res2.data || [])
      } catch {}
    }
    load()
  }, [])

  const filteredItems = items.filter(it => {
    if (!search) return true
    const s = search.toLowerCase()
    return (it.name || '').toLowerCase().includes(s) || (it.category || '').toLowerCase().includes(s)
  })

  const filteredPkgs = packages.filter(p => {
    if (!search) return true
    return (p.name || '').toLowerCase().includes(search.toLowerCase())
  })

  const addToCart = (it) => {
    setCart(prev => {
      const found = prev.find(c => c._id === it._id)
      if (found) return prev.map(c => c._id === it._id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...it, qty: 1, price: it.price || 0 }]
    })
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(c => c.filter(x => x._id !== id))
    else setCart(c => c.map(x => x._id === id ? { ...x, qty } : x))
  }

  const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0)

  // Payment + Auto Thermal Print
  const handlePay = async (mode) => {
    if (!customer.name || !customer.phone) {
      alert('Customer Name & Phone daal de bhai')
      return
    }
    if (cart.length === 0) {
      alert('Koi item add kar le pehle')
      return
    }
    setLoading(true)
    try {
      await api.post('/bills', {
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart,
        total,
        paidAmount: total,
        paymentMode: mode,
        paymentStatus: 'paid'
      })
      // Auto Print
      setTimeout(() => {
        window.print()
      }, 400)
      setShowPay(false)
      setCart([])
      alert('Bill Paid & Print bhej diya thermal pe!')
    } catch (e) {
      alert(fmtErr(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-5 pb-24">
      {/* TOP - CUSTOMER & BILL BEECH ME - Teri demand */}
      <div className="bg-white rounded-[20px] shadow-sm border p-6 mb-5">
        <h2 className="text-center font-bold text-xl mb-5">Customer & Bill</h2>
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center max-w-2xl mx-auto">
          <input
            placeholder="Customer Name"
            value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
            className="w-full md:w-64 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <input
            placeholder="Phone"
            value={customer.phone}
            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
            className="w-full md:w-64 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div className="text-center mt-5">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-3xl font-extrabold">{inr(total)}</div>
          <div className="text-xs text-gray-400 mt-1">{cart.length} items selected</div>
        </div>
      </div>

      {/* TABS + SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setTab('items')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === 'items' ? 'bg-black text-white' : 'text-gray-600'}`}
          >
            Items / Activities
          </button>
          <button
            onClick={() => setTab('packages')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === 'packages' ? 'bg-black text-white' : 'text-gray-600'}`}
          >
            Packages ({packages.length})
          </button>
        </div>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 w-48 md:w-64 text-sm"
        />
      </div>

      {/* BEECH ME ITEMS GRID - Full width, Items and Activities page se */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tab === 'items' && filteredItems.map(it => (
          <div
            key={it._id || it.name}
            onClick={() => addToCart(it)}
            className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition group"
          >
            <div className="font-semibold text-sm leading-tight group-hover:text-orange-600">{it.name}</div>
            <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">{it.category}</div>
            <div className="font-bold mt-2">{inr(it.price)}</div>
          </div>
        ))}
        {tab === 'packages' && filteredPkgs.map(pk => (
          <div
            key={pk._id || pk.name}
            onClick={() => addToCart(pk)}
            className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-orange-200"
          >
            <div className="font-semibold text-sm">{pk.name}</div>
            <div className="text-[11px] text-gray-400 mt-1">{pk.items?.length || 0} items</div>
            <div className="font-bold mt-2">{inr(pk.price)}</div>
          </div>
        ))}
      </div>

      {/* CART PREVIEW BEECH ME */}
      {cart.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border p-4">
          <div className="font-bold mb-3">Selected Items</div>
          <div className="space-y-2">
            {cart.map(c => (
              <div key={c._id} className="flex justify-between items-center text-sm">
                <span className="flex-1">{c.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(c._id, c.qty - 1)} className="w-7 h-7 rounded-full border">-</button>
                  <span className="w-6 text-center">{c.qty}</span>
                  <button onClick={() => updateQty(c._id, c.qty + 1)} className="w-7 h-7 rounded-full border">+</button>
                  <span className="w-20 text-right font-semibold">{inr(c.price * c.qty)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM STICKY PAY BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[280px] bg-white border-t p-3 flex justify-center md:justify-end z-10">
        <button
          onClick={() => setShowPay(true)}
          className="bg-black text-white px-10 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-900"
        >
          Pay {inr(total)}
        </button>
      </div>

      {/* PAYMENT POPUP + QR CODE ANDAR */}
      {showPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6">
            <h3 className="font-bold text-xl text-center">Payment - {inr(total)}</h3>
            <p className="text-center text-sm text-gray-500 mt-1">{customer.name} • {customer.phone}</p>

            {/* QR - Code ke andar fix hai */}
            {(payMode === 'UPI' || payMode === '') && (
              <div className="mt-5 text-center">
                <div className="bg-white p-3 rounded-2xl border inline-block">
                  <img src={QR_IMAGE} alt="Funland UPI QR" className="w-[200px] h-[200px] object-contain" />
                </div>
                <div className="mt-2 text-xs text-gray-500">Scan karke {inr(total)} pay karo</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => handlePay('Cash')} disabled={loading} className="border-2 border-gray-100 rounded-xl py-3 font-semibold hover:bg-gray-50">Cash</button>
              <button onClick={() => handlePay('Card')} disabled={loading} className="border-2 border-gray-100 rounded-xl py-3 font-semibold hover:bg-gray-50">Card</button>
              <button onClick={() => setPayMode('UPI')} className={`rounded-xl py-3 font-semibold ${payMode === 'UPI' ? 'bg-black text-white' : 'border-2 border-orange-200 bg-orange-50 text-orange-700'}`}>UPI - QR</button>
              <button onClick={() => handlePay('Online')} disabled={loading} className="border-2 border-gray-100 rounded-xl py-3 font-semibold hover:bg-gray-50">Online</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={() => setShowPay(false)} className="py-3 text-sm text-gray-500">Cancel</button>
              <button onClick={() => handlePay(payMode || 'UPI')} disabled={loading} className="bg-black text-white rounded-xl py-3 font-bold">
                {loading ? 'Saving...' : `Pay ${inr(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT AREA - Thermal + Official Bill */}
      <div id="print-area" className="hidden">
        <div id="thermal-bill" className="w-[80mm] p-2 text-[12px] leading-tight">
          <div className="text-center font-bold text-[14px]">Funland Adventure Park<br/>INDORE CRM</div>
          <div className="border-t border-dashed my-2"></div>
          <div>Name: {customer.name}</div>
          <div>Phone: {customer.phone}</div>
          <div>Date: {new Date().toLocaleString('en-IN')}</div>
          <div className="border-t border-dashed my-2"></div>
          {cart.map(c => (
            <div key={c._id} className="flex justify-between"><span>{c.name} x{c.qty}</span><span>{inr(c.price * c.qty)}</span></div>
          ))}
          <div className="border-t border-dashed my-2"></div>
          <div className="flex justify-between font-bold text-[14px]"><span>Total</span><span>{inr(total)}</span></div>
          <div className="text-center mt-3">Thank You! Visit Again</div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 80mm; }
          #thermal-bill { width: 80mm; }
        }
      `}</style>
    </div>
  )
}
