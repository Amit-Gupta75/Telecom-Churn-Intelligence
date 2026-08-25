import { useEffect, useState } from "react";
import { Search, Trash2, Eye, Pencil, UserPlus } from "lucide-react";
import { getCustomers, deleteCustomer, createCustomer } from "../../services/api";
import { useNavigate } from "react-router-dom"
import Loading from "../../components/Loading.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import AddCustomerModal from "../../components/AddCustomerModal";


function riskBadge(prob) {
  if (prob == null) return <span className="badge" style={{ background: "var(--surface-sunken)", color: "var(--ink-muted)" }}>Not scored</span>;
  if (prob >= 0.66) return <span className="badge badge-high">{Math.round(prob * 100)}% High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">{Math.round(prob * 100)}% Medium</span>;
  return <span className="badge badge-low">{Math.round(prob * 100)}% Low</span>;
}


export default function AdminCustomers(){
    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const [customers,setCustomers] = useState([]);
    const [search,setSearch] = useState("");

    const [name,setName] = useState("");
    const [location,setLocation] = useState("");

    const [showConfirm,setShowConfirm] = useState(false);
    const [selectedCustomer,setSelectedCustomer] = useState(null);
    const [deleting,setDeleting] = useState(false);
    const [showCustomerModal,setShowCustomerModal] = useState(false);


useEffect(()=>{

loadCustomers();

},[]);



const loadCustomers = async()=>{

try{

setLoading(true);

const data = await getCustomers();

setCustomers(data);


}catch(error){

console.log(error);

}
finally{

setLoading(false);

}

};



const quickAdd = async(e)=>{

  e.preventDefault();

  if(!name.trim()) return;

  await createCustomer({
    name,
    location,
    tenure: 0,
    monthlyCharges: 0,
    totalCharges: 0,
    contract: "Month-to-month"
  });

  setName("");
  setLocation("");
  setShowForm(false);

  loadCustomers();

};



const remove = async()=>{

try{

setDeleting(true);

await deleteCustomer(selectedCustomer);

setCustomers(
customers.filter(
(customer)=>customer._id !== selectedCustomer
)
);


}catch(error){

console.log(error);

}
finally{

setDeleting(false);
setShowConfirm(false);
setSelectedCustomer(null);

}


};




const filteredCustomers =
customers.filter((customer)=>

customer.name
?.toLowerCase()
.includes(search.toLowerCase())

);

const handleAddCustomer = async(data)=>{

try{

await createCustomer({

name:data.name,

email:data.email,

phone:data.phone,

password:data.password,

location:data.location

});


setShowCustomerModal(false);

loadCustomers();


}
catch(error){

console.log(error);

}

};



return (

<div>


<header
  style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-end",
    marginBottom:22
  }}
>

  <div>
    <div className="eyebrow">Customers</div>

    <h1 style={{ fontSize:26, marginTop:4 }}>
      Customer Management
    </h1>
  </div>

  <button
    className="btn btn-primary"
    onClick={()=>setShowCustomerModal(true)}
  >
    <UserPlus size={16}/>
    Add customer
  </button>

</header>



{
  showForm && (

    <form
      onSubmit={quickAdd}
      className="card"
      style={{ padding:16, marginBottom:18, display:"flex", gap:10 }}
    >

      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        placeholder="Customer name"
        required
        style={{ flex:2, padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8 }}
      />

      <input
        value={location}
        onChange={(e)=>setLocation(e.target.value)}
        placeholder="Location (optional)"
        style={{ flex:1, padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8 }}
      />

      <button type="submit" className="btn btn-primary">
        Save
      </button>

    </form>

  )
}



<div
  className="card"
  style={{ marginTop:0, marginBottom:20, padding:16, display:"flex", alignItems:"center", gap:10 }}
>

  <Search size={20}/>

  <input
    placeholder="Search customer..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    style={{ width:"100%", border:"none", outline:"none", fontSize:14 }}
  />

</div>



{
  loading
  ?
  <Loading />
  :
  <div className="card" style={{ padding:20, overflowX:"auto" }}>

    <table>

      <thead>
        <tr>
          <th>Name</th>
          <th>Location</th>
          <th>Contract</th>
          <th>Monthly Charges</th>
          <th>Churn Probability</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {
          filteredCustomers.map((customer)=>(

            <tr key={customer._id}>

              <td style={{fontWeight:600}}>{customer.name}</td>

              <td>{customer.location || "-"}</td>

              <td>{customer.contract}</td>

              <td>${Number(customer.monthlyCharges).toFixed(2)}</td>

              <td>{riskBadge(customer.churnProbability)}</td>

              <td>

                <div className="action-icons">

                  <div className="tooltip">
                    <button
                      className="icon-btn view-icon"
                      onClick={()=>navigate(`/admin/customers/${customer._id}`)}
                    >
                      <Eye size={17}/>
                    </button>
                    <span className="tooltip-text">View</span>
                  </div>

                  <div className="tooltip">
                    <button
                      className="icon-btn edit-icon"
                      onClick={()=>navigate(`/admin/customers/${customer._id}/edit`)}
                    >
                      <Pencil size={17}/>
                    </button>
                    <span className="tooltip-text">Edit</span>
                  </div>

                  <div className="tooltip">
                    <button
                      className="icon-btn delete-icon"
                      onClick={()=>{
                        setSelectedCustomer(customer._id);
                        setShowConfirm(true);
                      }}
                    >
                      <Trash2 size={17}/>
                    </button>
                    <span className="tooltip-text">Delete</span>
                  </div>

                </div>

              </td>

            </tr>

          ))
        }

        {
          filteredCustomers.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color:"var(--ink-muted)" }}>
                No customers found.
              </td>
            </tr>
          )
        }

      </tbody>

    </table>

  </div>
}


{
  showConfirm && (
    <ConfirmModal
      message="Are you sure you want to delete this customer?"
      loading={deleting}
      onCancel={()=>{
        setShowConfirm(false);
        setSelectedCustomer(null);
      }}
      onConfirm={remove}
    />
  )
}

{
showCustomerModal && (

<AddCustomerModal

onClose={()=>
setShowCustomerModal(false)
}

onCreate={handleAddCustomer}

/>

)
}

</div>

);

}
