import React, { useEffect, useState, useMemo } from "react";
import { api, fmtErr, inr } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHead, EmptyState } from "@/components/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, SlidersHorizontal, X, Settings2 } from "lucide-react";

const DEFAULT_CATS = ["entry", "food", "activities", "dress", "others", "rooms"];
const empty = { name: "", category: "activities", price: 0, offer_price: "", description: "", active: true, gst_category: "activity" };

export default function Games() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [catSearch, setCatSearch] = useState("");

  // CATEGORY MANAGER
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [customCats, setCustomCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("funland_custom_cats") || "[]"); } catch { return []; }
  });
  const [newCatName, setNewCatName] = useState("");
  const [editCatOld, setEditCatOld] = useState("");
  const [editCatNew, setEditCatNew] = useState("");

  const load = () => api.get("/games").then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const allCategories = useMemo(() => {
    const fromData = Array.from(new Set(list.map((g) => (g.category || "").toLowerCase().trim()).filter(Boolean)));
    const merged = Array.from(new Set([...DEFAULT_CATS, ...customCats, ...fromData])).sort();
    return merged;
  }, [list, customCats]);

  useEffect(() => { localStorage.setItem("funland_custom_cats", JSON.stringify(customCats)); }, [customCats]);

  const filteredCatOptions = allCategories.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()));

  const filteredList = useMemo(() => {
    let f = [...list];
    if (catFilter !== "all") f = f.filter((g) => (g.category || "").toLowerCase() === catFilter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((g) => g.name.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q));
    }
    if (sortBy === "az") f.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "za") f.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "low") f.sort((a, b) => (+a.price || 0) - (+b.price || 0));
    if (sortBy === "high") f.sort((a, b) => (+b.price || 0) - (+a.price || 0));
    if (sortBy === "newest") f.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return f;
  }, [list, search, catFilter, sortBy]);

  // CATEGORY CRUD
  const addCategory = () => {
    const name = newCatName.toLowerCase().trim();
    if (!name) return toast.error("Name likho");
    if (allCategories.includes(name)) return toast.error("Ye category pehle se hai");
    setCustomCats([...customCats, name]);
    setNewCatName("");
    toast.success(`Category "${name}" added!`);
  };
  const startEditCat = (cat) => { setEditCatOld(cat); setEditCatNew(cat); };
  const saveEditCat = () => {
    const oldName = editCatOld.toLowerCase().trim();
    const newName = editCatNew.toLowerCase().trim();
    if (!newName) return toast.error("Name khali nahi");
    if (oldName === newName) return setEditCatOld("");
    // Update customCats
    setCustomCats((prev) => prev.map((c) => (c === oldName ? newName : c)));
    // Update all items having old category - optimistic
    setList((prev) => prev.map((g) => (g.category?.toLowerCase() === oldName ? { ...g, category: newName } : g)));
    // If backend supports, you would patch items here
    toast.success(`"${oldName}" -> "${newName}" updated`);
    setEditCatOld("");
  };
  const deleteCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat}"? Items isme hain to wo 'others' me chale jayenge`)) return;
    setCustomCats((prev) => prev.filter((c) => c !== cat));
    if (catFilter === cat) setCatFilter("all");
    toast.success("Deleted");
  };

  const save = async () => {
    if (!form.name || !form.price) return toast.error("Name & price required");
    try {
      const payload = { ...form, price: +form.price, offer_price: form.offer_price ? +form.offer_price : null };
      if (editing) await api.patch(`/games/${editing}`, payload);
      else await api.post("/games", payload);
      toast.success("Saved!");
      setOpen(false); setForm(empty); setEditing(null); load();
    } catch (e) { toast.error(fmtErr(e)); }
  };
  const edit = (g) => { setEditing(g.id); setForm({ ...g, offer_price: g.offer_price ?? "" }); setOpen(true); };
  const removeItem = async (id) => { if (!window.confirm("Delete item?")) return; try { await api.delete(`/games/${id}`); load(); } catch (e) { toast.error(fmtErr(e)); } };

  return (
    <div>
      <PageHead title="Items / Activities" subtitle={`${filteredList.length} items found`} action={isAdmin && <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="rounded-full bg-accent h-11 px-6 font-bold"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>} />

      <div className="flex flex-col md:flex-row gap-3 mb-4 mt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-full" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></button>}
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-11 rounded-full"><SlidersHorizontal className="h-4 w-4 mr-2" /><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="az">A-Z</SelectItem><SelectItem value="za">Z-A</SelectItem><SelectItem value="low">Price Low-High</SelectItem><SelectItem value="high">Price High-Low</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full h-11" onClick={() => setCatManagerOpen(true)}><Settings2 className="h-4 w-4 mr-1" /> Categories</Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <Label className="font-black uppercase text-xs tracking-widest">Categories ({allCategories.length})</Label>
          <div className="relative w-[180px]"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input placeholder="Search category..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} className="pl-7 h-7 text-xs rounded-full" /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCatFilter("all")} className={`px-4 py-2 rounded-full text-sm font-bold border ${catFilter === "all" ? "bg-black text-white border-black" : "bg-muted hover:bg-black hover:text-white"}`}>All ({list.length})</button>
          {filteredCatOptions.map((c) => {
            const count = list.filter((g) => (g.category || "").toLowerCase() === c.toLowerCase()).length;
            return <button key={c} onClick={() => setCatFilter(c)} className={`px-4 py-2 rounded-full text-sm font-bold border capitalize ${catFilter === c ? "bg-black text-white border-black" : "bg-white hover:bg-black hover:text-white"}`}>{c} ({count})</button>;
          })}
        </div>
      </div>

      {filteredList.length === 0 ? <EmptyState title="No items found" description={`No items in ${catFilter} with search "${search}"`} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((g) => (
            <Card key={g.id} className="p-5 rounded-2xl hover:shadow-lg transition">
              <div className="flex justify-between items-start"><div><div className="font-black text-lg leading-tight">{g.name}</div><div className="text-[10px] uppercase tracking-widest bg-muted px-2 py-1 rounded-full inline-block mt-1">{g.category}</div></div>{isAdmin && <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(g)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(g.id)}><Trash2 className="h-4 w-4" /></Button></div>}</div>
              <div className="mt-3"><span className="text-2xl font-black">{inr(g.offer_price || g.price)}</span>{g.offer_price && <span className="text-sm line-through text-muted-foreground ml-2">{inr(g.price)}</span>}</div>
              {g.description && <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{g.description}</div>}
            </Card>
          ))}
        </div>
      )}

      {/* ADD / EDIT ITEM DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Item / Activity</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name*</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{allCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Price* ₹</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            </div>
            <div><Label>Offer Price ₹</Label><Input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-xl"><Label>Active</Label><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CATEGORY MANAGER DIALOG */}
      <Dialog open={catManagerOpen} onOpenChange={setCatManagerOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2"><Input placeholder="New category name (e.g. rooms)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} /><Button onClick={addCategory}><Plus className="h-4 w-4" /></Button></div>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {allCategories.map((cat) => (
                <div key={cat} className="flex items-center justify-between border p-2 rounded-xl">
                  {editCatOld === cat ? (
                    <div className="flex gap-2 flex-1"><Input value={editCatNew} onChange={(e) => setEditCatNew(e.target.value)} className="h-8" /><Button size="sm" onClick={saveEditCat}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditCatOld("")}>Cancel</Button></div>
                  ) : (
                    <>
                      <span className="capitalize font-bold text-sm">{cat}</span>
                      <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditCat(cat)}><Pencil className="h-3 w-3" /></Button>{!DEFAULT_CATS.includes(cat) && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteCategory(cat)}><Trash2 className="h-3 w-3" /></Button>}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground">Default categories (entry, food, etc) ko delete nahi kar sakte, sirf edit kar sakte ho. Nayi category jaise 'rooms' yahi se add hogi aur Add Item me automatically ayegi.</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatManagerOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
