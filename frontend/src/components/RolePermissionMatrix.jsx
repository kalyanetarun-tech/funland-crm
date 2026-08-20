export default function RolePermissionMatrix({permissions, setPermissions}){
  const modules = ['Prebookings','Inquiries','New Bill','Bills','Customers','Items / Activities','Packages','Attendance','Staff','Marketing','Reports','Settings','Expenses','WhatsApp','Excel Export'];
  const actions = ['View','Create','Edit','Delete','Export'];
  const toggle = (mod, act) => {
    const key = `${mod}_${act}`;
    setPermissions({...permissions, [key]: !permissions[key]});
  };
  return (
    <div className="border rounded-2xl overflow-hidden">
      <div className="bg-orange-50 p-3 font-bold">Role Permissions - Ek-ek cheez ka control</div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white"><tr><th className="p-2 text-left">Module</th>{actions.map(a=><th key={a} className="p-2">{a}</th>)}</tr></thead>
          <tbody>
            {modules.map(m=>(
              <tr key={m} className="border-t hover:bg-gray-50"><td className="p-2 font-medium">{m}</td>
                {actions.map(a=>{
                  const key = `${m}_${a}`;
                  return <td key={a} className="p-2 text-center"><input type="checkbox" checked={!!permissions[key]} onChange={()=>toggle(m,a)} className="w-4 h-4 accent-orange-500"/></td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
