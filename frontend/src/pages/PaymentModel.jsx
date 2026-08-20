import { useState } from 'react'

export default function PaymentModal({ total, onClose, onConfirm }){
  const [method, setMethod] = useState(null)
  const upiId = "funland@upi"
  const upiLink = `upi://pay?pa=${upiId}&pn=Funland&am=${total}&cu=INR`

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-[24px] p-6 w-full max-w-sm">
        <h2 className="font-bold text-xl">Payment kaise loge?</h2>
        <p className="text-sm text-gray-500 mb-4">Total ₹{total}</p>

        {!method? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={()=>setMethod("cash")} className="py-4 rounded-2xl border-2 font-bold hover:bg-black hover:text-white">💵 Cash</button>
            <button onClick={()=>setMethod("card")} className="py-4 rounded-2xl border-2 font-bold hover:bg-black hover:text-white">💳 Card</button>
            <button onClick={()=>setMethod("upi")} className="py-4 rounded-2xl border-2 font-bold hover:bg-black hover:text-white">📱 UPI</button>
            <button onClick={()=>setMethod("online")} className="py-4 rounded-2xl border-2 font-bold hover:bg-black hover:text-white">🌐 Online</button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-bold mb-3 uppercase">{method} - ₹{total}</p>
            {(method==="upi" || method==="online") && (
              <div className="bg-gray-50 p-3 rounded-2xl mb-3">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`} className="mx-auto rounded-xl w-[200px]" alt="QR"/>
                <a href={upiLink} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm mt-3 inline-block font-bold">UPI App me Kholo</a>
              </div>
            )}
            <button onClick={()=>onConfirm(method)} className="w-full bg-[#0a6b64] text-white py-4 rounded-full font-bold">Payment Done ✓ - Confirm</button>
            <button onClick={()=>setMethod(null)} className="w-full mt-2 text-sm">← Back</button>
          </div>
        )}
        <button onClick={onClose} className="w-full mt-4 text-sm text-gray-400">Cancel</button>
      </div>
    </div>
  )
}