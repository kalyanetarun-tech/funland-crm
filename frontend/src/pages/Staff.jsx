
import { useState } from "react";
import RolePermissionMatrix from "../components/RolePermissionMatrix";

export default function Staff(){
  const [staffs, setStaffs] = useState([{id:1, name:"Rahul Billing", email:"rahul@funland.com", role:"Billing Staff", phone:"9876543210"}]);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState({name:"", email:"", phone:"", role:"", password:""});
  const [roles, setRoles] = useState([
    {name:"Admin", permissions:{"All_View":true}},
    {name:"Billing Staff", permissions:{"New Bill_View":true, "Bills_View":true, "Customers_View":true}},
  ]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState({});
  const [showRoleCreator, setShowRoleCreator] = useState(false);

  const saveStaff = ()=>{
    if(!editing.name) return;
    setStaffs([...staffs, {id:Date.now(), ...editing}]);
    setShowEdit(false); setEditing({name:"", email:"", phone:"", role:"", password:""});
  };

  const createRole = ()=>{
    if(!newRoleName) return alert("Role name bharo");
    setRoles([...roles, {name:newRoleName, permissions:newRolePerms}]);
    setNewRoleName(""); setNewRolePerms({}); setShowRoleCreator(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-black">Staff Management - Full Control</h1><button onClick={()=>setShowEdit(true)} className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold">+ Add Staff</button></div>

      {showRoleCreator && (
        <div className="bg-white border-2 border-orange-200 rounded-[20px] p-5">
          <h3 className="font-bold mb-3">Naya Role Banao - Ek-ek cheez ka option</h3>
          <input value={newRoleName} onChange={e=>setNewRoleName(e.target.value)} placeholder="Role Name: e.g. Activity Incharge, Marketing Executive" className="border rounded-xl p-2 w-full mb-4"/>
          <RolePermissionMatrix permissions={newRolePerms} setPermissions={setNewRolePerms}/>
          <div className="flex gap-2 mt-4"><button onClick={createRole} className="bg-black text-white px-6 py-2 rounded-full font-bold">Role Save Karo</button><button onClick={()=>setShowRoleCreator(false)} className="bg-gray-100 px-6 py-2 rounded-full">Cancel</button></div>
        </div>
      )}

      {!showRoleCreator && <button onClick={()=>setShowRoleCreator(true)} className="text-sm bg-black text-white px-4 py-2 rounded-full">+ Naya Role Banao (Custom Permission)</button>}

      <div className="grid grid-cols-4 gap-3">
        {roles.map(r=> <div key={r.name} className="bg-white border rounded-xl p-3"><p className="font-bold text-sm">{r.name}</p><p className="text-[10px] text-gray-500">{Object.keys(r.permissions).filter(k=>r.permissions[k]).length} permissions</p></div>)}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Name</th><th>Role</th><th>Phone</th><th>Can See</th><th>Action</th></tr></thead>
          <tbody>{staffs.map(s=> <tr key={s.id} className="border-t"><td className="p-3 font-bold">{s.name}</td><td><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">{s.role}</span></td><td>{s.phone}</td><td className="text-xs text-gray-500">Bills, Customers...</td><td><button className="text-blue-600 text-xs">Edit Permissions</button></td></tr>)}</tbody>
        </table>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-md">
            <h3 className="font-black text-lg mb-4">Edit Staff - Har cheez ka control</h3>
            <div className="space-y-3">
              <input value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} placeholder="Name" className="w-full border rounded-xl p-3"/>
              <input value={editing.email} onChange={e=>setEditing({...editing, email:e.target.value})} placeholder="Email" className="w-full border rounded-xl p-3"/>
              <input value={editing.phone} onChange={e=>setEditing({...editing, phone:e.target.value})} placeholder="Phone" className="w-full border rounded-xl p-3"/>
              <select value={editing.role} onChange={e=>setEditing({...editing, role:e.target.value})} className="w-full border rounded-xl p-3"><option value="">Role Select Karo</option>{roles.map(r=> <option key={r.name} value={r.name}>{r.name}</option>)}</select>
              <input value={editing.password} onChange={e=>setEditing({...editing, password:e.target.value})} type="password" placeholder="Password" className="w-full border rounded-xl p-3"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={saveStaff} className="flex-1 bg-orange-500 text-white py-3 rounded-full font-bold">Save</button><button onClick={()=>setShowEdit(false)} className="flex-1 bg-gray-100 py-3 rounded-full font-bold">Cancel</button></div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Is role me jo permissions hain wahi is staff ko dikhenge</p>
          </div>
        </div>
      )}
    </div>
  )
}
