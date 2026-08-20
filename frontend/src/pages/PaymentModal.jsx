import React, { useState } from "react";

export default function PaymentModal({ isOpen, onClose, total = 0, onConfirm }) {
  const [method, setMethod] = useState("UPI");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-1">Payment - Rs.{total}</h2>
        <p className="text-sm text-gray-600 mb-4">UPI / Cash / Card select karo</p>

        <div className="flex gap-2 mb-5">
          {["UPI", "Cash", "Card"].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={"flex-1 border rounded-xl py-2 font-bold " + (method === m ? "bg-orange-500 text-white border-orange-500" : "")}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2">
            Close
          </button>
          <button
            onClick={() => onConfirm && onConfirm(method)}
            className="flex-1 bg-orange-500 text-white rounded-xl py-2 font-bold"
          >
            Paid
          </button>
        </div>
      </div>
    </div>
  );
}
