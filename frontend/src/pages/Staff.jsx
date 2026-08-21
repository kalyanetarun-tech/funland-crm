import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "https://funland.djpsindore.cloud";

export default function Staff(){
  const [staffs, setStaffs] = useState([]);
  const [editing, setEditing] = useState({name:"", email:"", phone:"", role:"", password:"", id:null});
  const [showEdit, setShowEdit] = useState(false);
  const [roles, setRoles] = useState([
    {name:"Admin", permissions:{"All_View":true, "All_Create":true, "All_Edit":true, "All_Delete":true}},
    {name:"Billing Staff", permissions:{"New Bill_View":true, "Bills_View":true, "Customers_View":true, "Dashboard_View":true}},
    {name:"marketing excutive", permissions:{"Bills_View":true, "Customers_View":true, "Marketing_View":true}},
  ]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [showPerm, setShowPerm] = useState(false);
  const [permRole, setPermRole] = useState(null);
  const token = localStorage.getItem("token");

  const fetchStaff = async()=>{
    try{
      const res = await fetch(`${API}/api/staff`, {headers:{Authorization:`Bearer ${token}`}});
      if(res.ok){
        const data = await res.json();
        setStaffs(data);
      }
    }catch(e){console.log(e)}
  };
  useEffect(()=>{fetchStaff();},[]);

  const openAdd = ()=>{
    setEditing({name:"", email:"", phone:"", role:roles[0]?.name||"", password:"", id:null});
    setShowEdit(true);
  };
  const openEdit = (s)=>{
    setEditing({name:s.name||"", email:s.email||"", phone:s.phone||"", role:s.role||"", password:"", id:s.id||s.email});
    setShowEdit(true);
  };

  const saveStaff = async()=>{
    if(!editing.name || !editing.email) return alert("Name aur Email bharo");
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `${API}/api/staff/${editing.id}` : `${API}/api/staff`;
    const payload = {...editing};
    if(editing.id && !payload.password) delete payload.password;
    try{
      const res = await fetch(url,{
        method,
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        const err = await res.json();
        return alert(err.detail||"Failed to save");
      }
      setShowEdit(false);
      fetchStaff();
    }catch(e){alert(e.message)}
  };

  const deleteStaff = async(id)=>{
    if(!confirm("Delete karna hai?")) return;
    await fetch(`${API}/api/staff/${id}`, {method:"DELETE", headers:{Authorization:`Bearer ${token}`}});
    fetchStaff();
  };

  const openPerm = (role)=>{
    setPermRole(role);
    setSelectedPermissions(role.permissions||{});
    setShowPerm(true);
  };

  const clearAll = ()=>{
    setSelectedPermissions({});
  };

  const savePerm = ()=>{
    const updated = roles.map(r=> r.name===permRole.name ? {...r, permissions:selectedPermissions} : r);
    setRoles(updated);
    setShowPerm(false);
  };

  const allPermKeys = ["Dashboard_View","New Bill_View","Bills_View","Customers_View","Games_View","Packages_View","Expenses_View","Reports_View","Marketing_View","Staff_View","Settings_View","All_View"];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Staff</button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map(s=>(
            <tr key={s.id||s.email}>
              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border">{s.role}</td>
              <td className="p-2 border">{s.phone}</td>
              <td className="p-2 border flex gap-2">
                <button onClick={()=>openEdit(s)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Edit</button>
                <button onClick={()=>deleteStaff(s.id||s.email)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mt-8 mb-2">Roles & Permissions</h2>
      {roles.map(r=>(
        <div key={r.name} className="border p-3 mb-2 flex justify-between">
          <div>
            <b>{r.name}</b> - {Object.keys(r.permissions||{}).filter(k=>r.permissions[k]).length} permissions
          </div>
          <button onClick={()=>openPerm(r)} className="text-blue-600 underline text-sm">Edit Permissions</button>
        </div>
      ))}

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-3">{editing.id ? "Edit Staff" : "Add Staff"}</h3>
            <input className="w-full border p-2 mb-2" placeholder="Name*" value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} />
            <input className="w-full border p-2 mb-2" placeholder="Email*" value={editing.email} onChange={e=>setEditing({...editing, email:e.target.value})} />
            <input className="w-full border p-2 mb-2" placeholder="Phone" value={editing.phone} onChange={e=>setEditing({...editing, phone:e.target.value})} />
            <select className="w-full border p-2 mb-2" value={editing.role} onChange={e=>setEditing({...editing, role:e.target.value})}>
              {roles.map(r=><option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <input className="w-full border p-2 mb-2" placeholder={editing.id ? "New Password (leave blank)" : "Password*"} value={editing.password} onChange={e=>setEditing({...editing, password:e.target.value})} />
            <div className="flex gap-2 mt-3">
              <button onClick={saveStaff} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">{editing.id ? "Update" : "Add"}</button>
              <button onClick={()=>setShowEdit(false)} className="bg-gray-300 px-4 py-2 rounded flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[500px] max-h-[80vh] overflow-auto">
            <h3 className="font-bold mb-3">Edit Permissions - {permRole?.name}</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {allPermKeys.map(k=>(
                <label key={k} className="flex items-center gap-2 border p-2 rounded">
                  <input type="checkbox" checked={!!selectedPermissions[k]} onChange={e=>setSelectedPermissions({...selectedPermissions, [k]: e.target.checked})} />
                  <span className="text-sm">{k}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={clearAll} className="bg-yellow-500 text-white px-4 py-2 rounded">Clear</button>
              <button onClick={savePerm} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">Save</button>
              <button onClick={()=>setShowPerm(false)} className="bg-gray-300 px-4 py-2 rounded flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}