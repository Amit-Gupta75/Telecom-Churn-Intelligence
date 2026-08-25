import { useState } from "react";
import { useParams } from "react-router-dom";
import { KeyRound } from "lucide-react";

import CustomerDetails from "../CustomerDetails.jsx";
import { createPortalLogin } from "../../services/api";


export default function AdminCustomerDetails(){

  const { id } = useParams();

  const [showForm,setShowForm] = useState(false);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [status,setStatus] = useState(null);
  const [saving,setSaving] = useState(false);


  const submit = async (e) => {

    e.preventDefault();

    try{

      setSaving(true);
      setStatus(null);

      await createPortalLogin(id, { email, password });

      setStatus({ type:"success", message:"Portal login created successfully." });
      setEmail("");
      setPassword("");
      setShowForm(false);

    }catch(error){

      setStatus({
        type:"error",
        message: error.response?.data?.message || "Failed to create portal login."
      });

    }
    finally{

      setSaving(false);

    }

  };


  return (

    <div>

      <CustomerDetails />

      <div className="card" style={{ padding:22, marginTop:20 }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <KeyRound size={18} color="var(--signal-mid)" />
            <span className="eyebrow">Customer portal access</span>
          </div>

          <button
            className="btn btn-ghost"
            onClick={()=>setShowForm((s)=>!s)}
          >
            {showForm ? "Cancel" : "Create portal login"}
          </button>

        </div>

        {
          status && (
            <p
              style={{
                marginTop:12,
                fontSize:13.5,
                color: status.type==="success" ? "var(--risk-low)" : "var(--risk-high)"
              }}
            >
              {status.message}
            </p>
          )
        }

        {
          showForm && (

            <form
              onSubmit={submit}
              style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}
            >

              <div className="field" style={{ flex:1, minWidth:200 }}>
                <label>Login email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>

              <div className="field" style={{ flex:1, minWidth:200 }}>
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ alignSelf:"flex-end" }}
              >
                {saving ? "Creating..." : "Create login"}
              </button>

            </form>

          )
        }

      </div>

    </div>

  );

}
