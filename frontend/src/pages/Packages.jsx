import React, { useEffect, useState } from "react";
import { api, fmtErr, inr } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHead, EmptyState } from "@/components/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X as XIcon } from "lucide-react";

const CAT_OPTIONS = [
  { v: "activity", label: "Activity", rate: 18 },
  { v: "food", label: "Food", rate: 5 },
  { v: "room", label: "Room", rate: 12 },
  { v: "clothing", label: "Clothing", rate: 12 },
  { v: "other", label: "Other", rate: 18 },
];
const ITEM_TO_GST = { entry: "activity", food: "food", activities: "activity", dress: "clothing", others: "other" };
const empty = { name: "", type: "birthday", category: "", price: 0, offer_price: "", pax: 1, inclusions: "", description: "", active: true, gst_split: [] };

export default function Packages() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const load = () => api.get("/packages").then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); api.get("/games").then((r) => setItems(r.data.filter((g) => g.active))).catch(() => {}); }, []);
  const save = async () => {
    if (!form.name || !form.price) return toast.error("Name & price required");
    const inclusions = typeof form.inclusions === "string" ? form.inclusions.split(",").map((s) => s.trim()).filter(Boolean) : form.inclusions;
    const price = +form.price;
    const gst_split = (form.gst_split || []).map((s) => ({ label: s.label.trim(), category: s.category, amount: +s.amount || 0, item_ref_id: s.item_ref_id })).filter((s) => s.amount > 0);
    const sum = gst_split.reduce((a, b) => a + b.amount, 0);
    if (gst_split.length > 0 && Math.abs(sum - price) > 0.5) return toast.error(`Split sum ${sum} != Price ${price}`);
    const payload = { ...form, inclusions, price, offer_price: form.offer_price ? +form.offer_price : null, pax: +form.pax || 1, gst_split, food_portion: 0, activity_portion: 0 };
    try { if (editing) await api.patch(`/packages/${editing}`, payload); else await api.post("/packages", payload); toast.success("Saved!"); setOpen(false); setForm(empty); setEditing(null); load(); } catch (e) { toast.error(fmtErr(e)); }
  };
  const edit = (p) => { setEditing(p.id); setForm({ ...p, inclusions: (p.inclusions || []).join(", "), offer_price: p.offer_price ?? "" }); setOpen(true); };
  const removePkg = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/packages/${id}`); load(); };
  const addItemToSplit = (item) => {
    if ((form.gst_split || []).find((r) => r.item_ref_id === item.id)) return toast.error("Already added");
    const gcat = ITEM_TO_GST[(item.category || "").toLowerCase()] || "activity";
    const price = +item.offer_price || +item.price || 0;
    setForm((f) => ({ ...f, gst_split: [...(f.gst_split || []), { label: item.name, category: gcat, amount: price, item_ref_id: item.id }] }));
  };
  const updateRow = (i, patch) => setForm((f) => ({ ...f, gst_split: f.gst_split.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));
  const removeRow = (i) => setForm((f) => ({ ...f, gst_split: f.gst_split.filter((_, idx) => idx !== i) }));
  const filteredItems = items.filter((i) => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
  return (
    <div>
      <PageHead title="Packages" action={isAdmin && <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Package</Button>} />
      <div className="grid grid-cols-2 gap-4 mt-4">{list.map((p) => (<Card key={p.id} className="p-4"><div className="font-bold">{p.name}</div><div>{inr(p.price)}</div><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => removePkg(p.id)}><Trash2 className="h-4 w-4" /></Button></div></Card>))}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Package</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><div><Label>Name*</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div><Label>Pax</Label><Input type="number" value={form.pax} onChange={(e) => setForm({ ...form, pax: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Price*</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div><div><Label>Offer</Label><Input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} /></div></div>
            <div className="border-2 border-primary/20 rounded-xl p-3 space-y-2">
              <Label>Package Builder - Items side se jodo</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-xl p-2 bg-white"><div className="text-xs font-bold mb-2">All Items ({filteredItems.length})</div><Input placeholder="Search..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="h-8 mb-2" /><div className="h-[300px] overflow-auto space-y-1">{filteredItems.map((it) => (<div key={it.id} className="flex justify-between border p-2 rounded"><span className="text-sm truncate">{it.name}</span><Button size="sm" className="h-6" onClick={() => addItemToSplit(it)}>Add</Button></div>))}</div></div>
                <div className="border rounded-xl p-2 bg-white"><div className="text-xs font-bold mb-2">Package Me ({form.gst_split.length})</div><div className="h-[340px] overflow-auto space-y-2">{form.gst_split.map((row, i) => (<div key={i} className="border p-2 rounded bg-gray-50"><div className="flex gap-2"><Input value={row.label} onChange={(e) => updateRow(i, { label: e.target.value })} className="h-7 text-xs" /><Button size="icon" variant="ghost" onClick={() => removeRow(i)}><XIcon className="h-4 w-4" /></Button></div><div className="grid grid-cols-2 gap-2 mt-1"><select value={row.category} onChange={(e) => updateRow(i, { category: e.target.value })} className="h-7 border rounded text-xs"><option value="activity">Activity</option><option value="food">Food</option><option value="room">Room</option><option value="clothing">Clothing</option><option value="other">Other</option></select><Input type="number" value={row.amount} onChange={(e) => updateRow(i, { amount: e.target.value })} className="h-7 text-xs" /></div></div>))}</div></div>
              </div>
            </div>
            <div><Label>Inclusions</Label><Textarea value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
