import { useEffect, useState } from "react";
import { UserPlus, Eye, Trash2, X } from "lucide-react";

import { getEmployees, createEmployee, deleteEmployee } from "../../services/api";
import Loading from "../../components/Loading.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";


const emptyForm = { name:"", email:"", password:"", location:"", region:"" };


export default function Employees(){

  const [employees,setEmployees] = useState([]);
  const [loading,setLoading] = useState(true);

  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState(emptyForm);
  const [creating,setCreating] = useState(false);
  const [formError,setFormError] = useState("");

  const [viewing,setViewing] = useState(null);

  const [showConfirm,setShowConfirm] = useState(false);
  const [selected,setSelected] = useState(null);
  const [deleting,setDeleting] = useState(false);


  useEffect(()=>{
    load();
  },[]);


  const load = async()=>{
    try{
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    }catch(error){
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  };


  const update = (key) => (e) => setForm((f)=>({ ...f, [key]:e.target.value }));


  const submit = async(e)=>{

    e.preventDefault();

    try{

      setCreating(true);
      setFormError("");

      await createEmployee(form);

      setForm(emptyForm);
      setShowForm(false);
      load();

    }catch(error){

      setFormError(error.response?.data?.message || "Failed to create employee");

    }
    finally{

      setCreating(false);

    }

  };


  const remove = async()=>{

    try{

      setDeleting(true);

      await deleteEmployee(selected);

      setEmployees((prev)=>prev.filter((e)=>e._id !== selected));

    }catch(error){

      console.log(error);

    }
    finally{

      setDeleting(false);
      setShowConfirm(false);
      setSelected(null);

    }

  };


  return (

    <div>

      <header
        style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:22 }}
      >

        <div>
          <div className="eyebrow">Admin</div>
          <h1 style={{ fontSize:26, marginTop:4 }}>Employee Management</h1>
        </div>

        <button className="btn btn-primary" onClick={()=>setShowForm(true)}>
          <UserPlus size={16}/>
          Add Employee
        </button>

      </header>


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
                <th>Email</th>
                <th>Location</th>
                <th>Region</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {
                employees.map((employee)=>(

                  <tr key={employee._id}>

                    <td style={{ fontWeight:600 }}>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.location || "-"}</td>
                    <td>{employee.region || "-"}</td>

                    <td>

                      <div className="action-icons">

                        <div className="tooltip">
                          <button
                            className="icon-btn view-icon"
                            onClick={()=>setViewing(employee)}
                          >
                            <Eye size={17}/>
                          </button>
                          <span className="tooltip-text">View</span>
                        </div>

                        <div className="tooltip">
                          <button
                            className="icon-btn delete-icon"
                            onClick={()=>{
                              setSelected(employee._id);
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
                employees.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ color:"var(--ink-muted)" }}>
                      No employees yet — add one to get started.
                    </td>
                  </tr>
                )
              }

            </tbody>

          </table>

        </div>
      }


      {
        showForm && (

          <div className="modal-overlay">

            <div className="confirm-box" style={{ width:420, textAlign:"left" }}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3>Add Employee</h3>
                <button
                  onClick={()=>{ setShowForm(false); setFormError(""); }}
                  style={{ background:"none", border:"none" }}
                >
                  <X size={18}/>
                </button>
              </div>

              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16 }}>

                <div className="field">
                  <label>Name</label>
                  <input required value={form.name} onChange={update("name")} />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input type="email" required value={form.email} onChange={update("email")} />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input type="password" required value={form.password} onChange={update("password")} />
                </div>

                <div className="field">
                  <label>Location</label>
                  <input value={form.location} onChange={update("location")} />
                </div>

                <div className="field">
                  <label>Region</label>
                  <input value={form.region} onChange={update("region")} />
                </div>

                {
                  formError && (
                    <p style={{ color:"var(--risk-high)", fontSize:13 }}>{formError}</p>
                  )
                }

                <button type="submit" className="btn btn-primary" disabled={creating} style={{ justifyContent:"center" }}>
                  {creating ? "Creating..." : "Create Employee"}
                </button>

              </form>

            </div>

          </div>

        )
      }


      {
        viewing && (

          <div className="modal-overlay">

            <div className="confirm-box" style={{ width:380 }}>

              <h3>{viewing.name}</h3>

              <div style={{ textAlign:"left", marginTop:14, fontSize:13.5, display:"flex", flexDirection:"column", gap:8 }}>
                <div><strong>Email:</strong> {viewing.email}</div>
                <div><strong>Location:</strong> {viewing.location || "-"}</div>
                <div><strong>Region:</strong> {viewing.region || "-"}</div>
                <div><strong>Role:</strong> {viewing.role}</div>
              </div>

              <button
                className="btn btn-ghost"
                style={{ marginTop:20, width:"100%", justifyContent:"center" }}
                onClick={()=>setViewing(null)}
              >
                Close
              </button>

            </div>

          </div>

        )
      }


      {
        showConfirm && (
          <ConfirmModal
            message="Are you sure you want to delete this employee?"
            loading={deleting}
            onCancel={()=>{ setShowConfirm(false); setSelected(null); }}
            onConfirm={remove}
          />
        )
      }

    </div>

  );

}
