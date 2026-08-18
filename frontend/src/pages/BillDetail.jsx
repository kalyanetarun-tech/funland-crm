import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function BillDetail() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const autoPay = search.get("pay") === "1";
  const [bill, setBill] = useState(null);
  const [showPay, setShowPay] = useState(autoPay);
  const [payMode, setPayMode] = useState("UPI");
  const [paid, setPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/bills/${id}`).then(r => setBill(r.data.data || r.data));
  }, [id]);

  const handlePaymentDone = async () => {
    await api.put(`/bills/${id}`, { status: "Paid", paymentMode: payMode, paidAt: new Date() });
    setPaid(true);
    setShowPay(false);
    setBill(b => ({...b, status: "Paid", paymentMode: payMode}));
  };

  const handlePrint = () => {
    window.print();
  };

  if(!bill) return <div className="p-8">Loading bill...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-[#faf8f5] min-h-screen">
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={()=>navigate("/bills")} className="text-sm">← Back to Bills</button>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${bill.status==="Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{bill.status}</span>
          <button onClick={handlePrint} className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold">🖨️ Print Bill</button>
        </div>
      </div>

      <div id="bill-print-area" className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex justify-between">
          <div>
            <h2 className="font-black text-xl">FUNLAND</h2>
            <p className="text-[11px] text-gray-500">Indore CRM - A Unit of Hotel Linear Inn</p>
            <p className="text-xs mt-2">Bill #: {bill.billNumber || bill._id.slice(-6).toUpperCase()}</p>
            <p className="text-xs">Date: {new Date(bill.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">{bill.customerDetails?.name || bill.customer?.name}</p>
            <p className="text-xs text-gray-600">{bill.customerDetails?.phone}</p>
            {bill.customerDetails?.gstin && <p className="text-xs">GSTIN: {bill.customerDetails?.gstin}</p>}
            {bill.gstEnabled ? <p className="text-xs text-orange-600 font-bold mt-1">GST 18% Applied</p> : <p className="text-xs text-gray-400">GST OFF</p>}
          </div>
        </div>

        <table className="w-full mt-6 text-sm">
          <thead className="border-b text-[11px] tracking-widest text-gray-400">
            <tr><th className="text-left py-2">ITEM</th><th className="text-center">QTY</th><th className="text-right">AMOUNT</th></tr>
          </thead>
          <tbody>
            {(bill.items||[]).map((it,i)=>(
              <tr key={i} className="border-b border-gray-50"><td className="py-2">{it.name}</td><td className="text-center">{it.qty}</td><td className="text-right">₹{it.price * it.qty}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto w-64 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-₹{bill.discount||0}</span></div>
          {bill.gstEnabled && <div className="flex justify-between"><span>GST 18%</span><span>₹{bill.gst}</span></div>}
          <div className="flex justify-between font-black text-base border-t pt-2 mt-2"><span>Total</span><span>₹{bill.total}</span></div>
        </div>

        <div className="mt-8 text-[10px] text-center text-gray-400">Thank you for visiting Funland! Visit again.</div>
      </div>

      {/* PAYMENT MODAL */}
      {showPay && !paid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white w-full max-w-md rounded-[24px] p-6 shadow-2xl">
            <h3 className="font-black text-lg">Complete Payment - ₹{bill.total}</h3>
            <p className="text-xs text-gray-500 mb-4">Bill ID: {bill._id.slice(-8)} | Customer: {bill.customerDetails?.name}</p>
            
            <div className="grid grid-cols-4 gap-2 mb-5">
              {["Cash","UPI","Card","Online"].map(m=>(
                <button key={m} onClick={()=>setPayMode(m)} className={`py-2.5 rounded-xl text-xs font-bold border ${payMode===m ? "bg-black text-white border-black" : "bg-white border-gray-200"}`}>{m}</button>
              ))}
            </div>

            {payMode==="UPI" && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center border">
                <img src="/qr.png" alt="PhonePe QR" className="w-56 h-56 mx-auto rounded-xl bg-white p-2" />
                <p className="text-[11px] font-bold mt-3 tracking-widest">SCAN & PAY Using PhonePe App</p>
                <p className="text-xs mt-2">UPI ID: <b className="text-blue-600">linearcurrent@ybl</b></p>
                <div className="text-[11px] mt-3 text-left bg-white p-3 rounded-xl">
                  <p className="font-bold">Hotel Linear Inn</p>
                  <p>A/c: 1815070950 | IFSC: KKBK0005963</p>
                  <p>Kotak Mahindra Bank</p>
                </div>
              </div>
            )}

            {payMode!=="UPI" && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm">
                <p>Payment Mode: <b>{payMode}</b> selected.</p>
                <p className="text-xs text-gray-600 mt-1">Please collect payment via {payMode} and confirm below.</p>
                {payMode==="Cash" && <p className="mt-2 font-bold">Collect: ₹{bill.total}</p>}
              </div>
            )}

            <button onClick={handlePaymentDone} className="w-full bg-[#0a6b64] text-white py-3.5 rounded-xl font-bold mt-5">Payment Done - Confirm & Print</button>
            <button onClick={()=>setShowPay(false)} className="w-full text-xs text-gray-400 mt-3">Skip for now</button>
          </div>
        </div>
      )}

      {paid && (
        <div className="fixed bottom-6 right-6 no-print flex gap-3">
          <button onClick={handlePrint} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-xl">🖨️ Print Now</button>
          <button onClick={()=>navigate("/bills")} className="bg-white border px-6 py-3 rounded-full font-bold shadow-xl">Go to Bills</button>
        </div>
      )}

      {!showPay && bill.status!=="Paid" && (
        <div className="no-print mt-6 text-center">
          <button onClick={()=>setShowPay(true)} className="bg-[#ff5a1f] text-white px-8 py-3 rounded-full font-bold">💳 Pay Now / Show QR</button>
        </div>
      )}
    </div>
  );
}