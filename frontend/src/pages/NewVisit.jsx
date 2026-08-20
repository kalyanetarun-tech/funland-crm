import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Visit({ items: initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); // Pehle yaha Activities tha, isiliye blank tha

  // Live API se items lena hai to
  useEffect(() => {
    if (!initialItems) {
      fetch('/api/items')
        .then(res => res.json())
        .then(data => setItems(data.items || data));
    }
  }, []);

  const categories = [
    { name: "All", count: items.length },
    { name: "Activities", count: items.filter(i => i.category === 'Activities').length },
    { name: "Beverage", count: items.filter(i => i.category === 'Beverage').length },
    { name: "Food", count: items.filter(i => i.category === 'Food').length },
    { name: "Entry", count: items.filter(i => i.category === 'Entry').length },
    { name: "Others", count: items.filter(i => i.category === 'Others').length },
  ];

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" ? true : item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Items / Activities - {filteredItems.length} items found</h1>
      
      <div className="my-4 flex gap-2">
        <Input placeholder="Search items by name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 flex-wrap my-4">
        {categories.map(cat => (
          <Button
            key={cat.name}
            variant={selectedCategory === cat.name ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.name)}
            className={selectedCategory === cat.name ? "bg-orange-500 text-white" : ""}
          >
            {cat.name} ({cat.count})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="p-4">
            <h3 className="font-bold">{item.name}</h3>
            <Badge>{item.category}</Badge>
            <p className="mt-2 font-bold">₹{item.price}</p>
            <Button className="mt-2 w-full">Add to Bill</Button>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center mt-10 text-gray-500">No items found in {selectedCategory}</div>
      )}
    </div>
  );
}