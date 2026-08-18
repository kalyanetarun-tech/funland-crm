import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, fmtErr, inr } from "@/lib/api";
import { PageHead, EmptyState } from "@/components/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Receipt, Send, Printer, MessageCircle, Mail, Phone, ExternalLink, Plus } from "lucide-react";
import UpiPayBlock from "@/components/UpiPayBlock";

export function BillsList() {
  const [bills, setBills] = useState(null);
  useEffect(() => { api.get("/bills").then((r) => setBills(r.data)).catch(() => setBills([])); }, []);
  return (
    <div>
      <PageHead title="Bills" subtitle="Sabhi customer bills aur payment status" />
      {bills === null? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Card key={i} className="p-5 rounded-2xl h-40 animate-pulse bg-muted" />)}
        </div>
      ) : bills.length === 0? <EmptyState title="No bills yet" description="Naya bill banane ke liye 'New Bill' pe jao." /> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {bills.map((b) => (
            <Card key={b.id} className="p-5 rounded-2xl hover:shadow-md transition-shadow" data-testid={`bill-card-${b.id}`}>
              <Link to={`/bills/${b.id}`} className="block">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{b.bill_no}</div>
                  <Badge className={`rounded-full ${b.payment_status === "paid"? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-primary/20 text-accent border-primary"}`}>{b.payment_status}</Badge>
                </div>
                <div className="font-black text-lg mb-1">{b.customer_name}</div>
                <div className="text-sm text-muted-foreground mb-3">{b.customer_phone || "—"} · {b.items?.length || 0} items</div>
                <div className="text-3xl font-black text-accent">{inr(b.total)}</div>
                <div className="text-xs text-muted-foreground mt-2">{b.created_at? new Date(b.created_at).toLocaleString() : ""}</div>
              </Link>
              <Button data-testid={`bill-quick-print-${b.id}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/bills/${b.id}/print?mode=receipt`, "_blank"); }} variant="outline" size="sm" className="w-full mt-3 rounded-full font-bold border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Printer className="h-4 w-4 mr-1" /> Print Receipt
              </Button>
            </Card>
          ))}
        </div>}
    </div>
  );
}

export function BillDetail() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState("whatsapp");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("item");
  const [newItem, setNewItem] = useState({ name: "", qty: 1, price: 0, gst_percent: 18, category: "item" });

  const load = () => api.get(/bills/${id}).then((r) => {
  setBill(r.data);
  setGstEnabled(false);
}).catch((e) => setError(fmtErr(e)));

  useEffect(() => { load(); api.get("/settings").then((r) => setSettings(r.data)).catch(() => {}); }, [id]);

  const markPaid = async () => {
    try { await api.patch(`/bills/${bill.id}/status`, { payment_status: "paid" }); toast.success("Marked paid"); load(); }
    catch (e) { toast.error(fmtErr(e)); }
  };
  const sendBill = async () => {
    try {
      const { data } = await api.post(`/bills/${bill.id}/send`, { channel: sendChannel });
      toast.success(data?.delivery?.simulated? `Simulated ${sendChannel} send` : `Sent via ${sendChannel}`);
      setSendOpen(false);
    } catch (e) { toast.error(fmtErr(e)); }
  };

  const handleAddItem = async () => {
    if (!newItem.name || newItem.price <= 0) { toast.error("Name aur Price daalo"); return; }
    try {
      await api.post(`/bills/${bill.id}/items`, {
        name: newItem.name,
        qty: Number(newItem.qty),
        price: Number(newItem.price),
        gst_percent: gstEnabled? Number(newItem.gst_percent) : 0,
        category: addType,
        kind: addType
      });
      toast.success(`${addType} added`);
      setAddOpen(false);
      setNewItem({ name: "", qty: 1, price: 0, gst_percent: 18, category: "item" });
      load();
    } catch (e) {
      const tempBill = {...bill, items: [...(bill.items || []), {...newItem, qty: Number(newItem.qty), price: Number(newItem.price), gst_percent: gstEnabled? Number(newItem.gst_percent) : 0, category: addType, kind: addType }] };
      setBill(tempBill);
      toast.success("Locally added");
      setAddOpen(false);
    }
  };

  if (error) return (
    <div className="p-8 text-center">
      <div className="text-lg font-bold mb-2">Bill load nahi ho paya</div>
      <div className="text-sm text-muted-foreground mb-4">{error}</div>
      <Button onClick={() => { setError(null); load(); }} className="rounded-full">Retry</Button>
    </div>
  );
  if (!bill) return (
    <div className="p-8 space-y-4">
      <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
      <Card className="p-8 rounded-2xl h-96 animate-pulse bg-muted/50" />
    </div>
  );

  const items = bill.items || [];
  const settingsSafe = settings || {};
  const calcItem = (it) => {
    const base = (it.price || 0) * (it.qty || 0);
    const gstAmt = gstEnabled? base * ((it.gst_percent || 0) / 100) : 0;
    const total = base + gstAmt;
    return { base, gstAmt, total };
  };
  const subtotalCalc = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
  const gstCalc = gstEnabled? items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 0) * ((it.gst_percent || 0)/100)), 0) : 0;
  const finalTotal = subtotalCalc - (bill.discount || 0) + gstCalc;

  return (
    <div>
      <PageHead
        title={`Bill ${bill.bill_no || ""}`}
        subtitle={`${bill.customer_name} · ${bill.created_at? new Date(bill.created_at).toLocaleString() : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            {bill.payment_status === "pending" && <Button data-testid="mark-paid" onClick={markPaid} className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">Mark Paid</Button>}
            <Button data-testid="print-receipt-btn" onClick={() => window.open(`/bills/${bill.id}/print?mode=receipt&gst=${gstEnabled? 1 : 0}`, "_blank")} variant="outline" className="rounded-full font-bold h-11 px-4"><Printer className="h-4 w-4 mr-1" /> Customer Receipt</Button>
            <Button data-testid="print-invoice-btn" onClick={() => window.open(`/bills/${bill.id}/print?mode=invoice&gst=${gstEnabled? 1 : 0}`, "_blank")} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11 px-4"><Printer className="h-4 w-4 mr-1" /> Tax Invoice</Button>
            <Button data-testid="send-btn" onClick={() => setSendOpen(true)} variant="outline" className="rounded-full"><Send className="h-4 w-4 mr-1" /> Send</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 rounded-2xl">
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
            <div>
              <div className="font-black text-3xl"><span className="text-accent">Fun</span><span className="text-secondary">land</span></div>
              <div className="text-sm text-muted-foreground mt-1">{settingsSafe.park_name || "Adventure Park"}</div>
              <div className="text-xs text-muted-foreground">{settingsSafe.address}</div>
              {settingsSafe.phone && <div className="text-xs text-muted-foreground">Ph: {settingsSafe.phone}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Invoice</div>
              <div className="font-black text-lg">{bill.bill_no}</div>
              <Badge className={`mt-2 rounded-full ${bill.payment_status === "paid"? "bg-emerald-100 text-emerald-800" : "bg-primary/20 text-accent"}`}>{bill.payment_status}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setAddType("item"); setAddOpen(true); }} className="rounded-full"><Plus className="h-4 w-4 mr-1"/> Add Item</Button>
              <Button size="sm" variant="outline" onClick={() => { setAddType("activity"); setAddOpen(true); }} className="rounded-full"><Plus className="h-4 w-4 mr-1"/> Add Activity</Button>
              <Button size="sm" variant="outline" onClick={() => { setAddType("package"); setAddOpen(true); }} className="rounded-full"><Plus className="h-4 w-4 mr-1"/> Add Package</Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold">GST</Label>
              <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Bill To</div>
              <div className="font-bold">{bill.customer_name}</div>
              {bill.customer_phone && <div className="text-muted-foreground">{bill.customer_phone}</div>}
              {bill.customer_email && <div className="text-muted-foreground">{bill.customer_email}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Details</div>
              <div>Method: <span className="font-bold">{bill.payment_method}</span></div>
              <div>Staff: <span className="font-bold">{bill.created_by_name}</span></div>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">Item</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">Qty</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">Price</th>
                {gstEnabled && <th className="text-right py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">GST</th>}
                <th className="text-right py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const { gstAmt, total } = calcItem(it);
                return (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 font-semibold">{it.name}<span className="ml-2 text-xs text-muted-foreground uppercase">{it.category || it.kind}</span></td>
                    <td className="text-right">{it.qty}</td>
                    <td className="text-right">{inr(it.price)}</td>
                    {gstEnabled && <td className="text-right text-xs">{inr(gstAmt)}<br/><span className="text-muted-foreground">({it.gst_percent || 0}%)</span></td>}
                    <td className="text-right font-bold">{inr(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="ml-auto max-w-xs space-y-2">
            <Row label="Subtotal" value={inr(subtotalCalc)} />
            {(bill.discount || 0) > 0 && <Row label={`Discount${bill.discount_percent? ` (${bill.discount_percent}%)` : ""}`} value={`- ${inr(bill.discount)}`} />}
            {gstEnabled && <Row label="GST" value={inr(gstCalc)} />}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-lg font-black">Total</span>
              <span className="text-3xl font-black text-accent">{inr(gstEnabled? finalTotal : subtotalCalc - (bill.discount || 0))}</span>
            </div>
          </div>

          {bill.notes && <div className="mt-6 p-3 bg-muted rounded-xl text-sm italic text-muted-foreground">Note: {bill.notes}</div>}
        </Card>

        <div className="space-y-4">
          <Card className="p-5 rounded-2xl" data-testid="bill-pay-card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-secondary">Pay Now</div>
              {(settingsSafe.upi_qr_url || settingsSafe.upi_id) && (
                <Button data-testid="bill-fullscreen-qr" size="sm" onClick={() => setQrOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 h-8 px-3 font-bold text-xs">
                  Fullscreen QR
                </Button>
              )}
            </div>
            {bill.razorpay_link? (
              <a href={bill.razorpay_link} target="_blank" rel="noreferrer" className="block p-4 border-2 border-accent rounded-xl text-center font-bold hover:bg-accent hover:text-accent-foreground transition-colors mb-3">Pay via Razorpay <ExternalLink className="inline h-4 w-4" /></a>
            ) : null}
            {(settingsSafe.upi_qr_url || settingsSafe.upi_id)? (
              <UpiPayBlock settings={settingsSafe} amount={gstEnabled? finalTotal : subtotalCalc - (bill.discount || 0)} note={`Bill ${bill.bill_no}`} />
            ) : null}
          </Card>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-black">Add {addType}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Name" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Qty</Label><Input type="number" value={newItem.qty} onChange={(e) => setNewItem({...newItem, qty: e.target.value})} /></div>
              <div><Label>Price</Label><Input type="number" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} /></div>
              <div><Label>GST %</Label><Input type="number" value={newItem.gst_percent} disabled={!gstEnabled} onChange={(e) => setNewItem({...newItem, gst_percent: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleAddItem} className="rounded-full bg-accent">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-black text-center">Pay {inr(gstEnabled? finalTotal : subtotalCalc)}</DialogTitle></DialogHeader>
          <div className="p-4 flex flex-col items-center">
            {settingsSafe.upi_qr_url? (
              <img src={settingsSafe.upi_qr_url} alt="UPI QR" className="w-72 h-72 object-contain bg-white rounded-2xl border-4 border-accent shadow-2xl" />
            ) : (
              <div className="w-72 h-72 bg-white rounded-2xl border-4 border-accent p-3 shadow-2xl">
                <QRCode value={`upi://pay?pa=${encodeURIComponent(settingsSafe.upi_id || "")}&pn=${encodeURIComponent(settingsSafe.firm_name || settingsSafe.park_name || "Funland")}&am=${Number(gstEnabled? finalTotal : subtotalCalc).toFixed(2)}&cu=INR&tn=${encodeURIComponent("Bill " + bill.bill_no)}`} size={264} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Send Bill</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {[{ v: "whatsapp", label: "WhatsApp", icon: MessageCircle },{ v: "sms", label: "SMS", icon: Phone },{ v: "email", label: "Email", icon: Mail }].map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.v} onClick={() => setSendChannel(c.v)} className={`p-4 rounded-xl border-2 ${sendChannel === c.v? "border-accent bg-accent/10" : "border-border"}`}>
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-bold">{c.label}</div>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={sendBill} className="rounded-full bg-accent">Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div>;
}