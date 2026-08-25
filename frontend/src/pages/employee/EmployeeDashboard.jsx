import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, Clock, Eye } from "lucide-react";

import { getCustomers, getAllInteractions } from "../../services/api";
import Loading from "../../components/Loading.jsx";


function riskBadge(prob) {
  if (prob >= 0.66) return <span className="badge badge-high">{Math.round(prob * 100)}% High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">{Math.round(prob * 100)}% Medium</span>;
  return <span className="badge badge-low">{Math.round(prob * 100)}% Low</span>;
}


export default function EmployeeDashboard(){

  const navigate = useNavigate();

  const [customers,setCustomers] = useState([]);
  const [pendingFollowups,setPendingFollowups] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");


  useEffect(()=>{

    load();

  },[]);


  const load = async()=>{

    try{

      setLoading(true);

      const [custs, interactions] = await Promise.all([
        getCustomers(),
        getAllInteractions().catch(()=>[])
      ]);

      setCustomers(custs);

      // High-severity touchpoints are the ones that still need a follow-up.
      setPendingFollowups(interactions.filter((i)=>i.severity === "high").length);

      setError("");

    }catch(err){

      setError("Unable to load dashboard data");

    }
    finally{

      setLoading(false);

    }

  };


  if(loading) return <Loading label="Loading dashboard…" />;
  if(error) return <h2>{error}</h2>;


  const highRisk = customers.filter((c)=>c.churnProbability >= 0.66);

  const cards = [
    { title:"Assigned Customers", value:customers.length, icon:Users, tint:"#1B6E7F" },
    { title:"High Risk Customers", value:highRisk.length, icon:AlertTriangle, tint:"#E4536B" },
    { title:"Pending Followups", value:pendingFollowups, icon:Clock, tint:"#F2A445" }
  ];


  return (

    <div>

      <div className="eyebrow">Employee</div>
      <h1 style={{ fontSize:26, marginTop:4 }}>Dashboard</h1>
      <p style={{ color:"var(--ink-muted)", marginTop:6 }}>
        Your customer book at a glance.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20, marginTop:25 }}>

        {
          cards.map((item)=>{

            const Icon = item.icon;

            return (

              <div className="card" key={item.title} style={{ padding:22 }}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span className="eyebrow">{item.title}</span>
                  <span style={{ width:30, height:30, borderRadius:9, display:"grid", placeItems:"center", background:item.tint+"22", color:item.tint }}>
                    <Icon size={16}/>
                  </span>
                </div>

                <h2 style={{ marginTop:12, fontSize:26 }}>{item.value}</h2>

              </div>

            );

          })
        }

      </div>


      <div className="card" style={{ marginTop:20, padding:22, overflowX:"auto" }}>

        <span className="eyebrow">High risk customers</span>

        <table style={{ marginTop:14 }}>

          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Risk</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {
              highRisk.slice(0,8).map((c)=>(

                <tr key={c._id}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td>{c.location || "-"}</td>
                  <td>{riskBadge(c.churnProbability)}</td>
                  <td>
                    <div className="tooltip">
                      <button
                        className="icon-btn view-icon"
                        onClick={()=>navigate(`/employee/customers/${c._id}`)}
                      >
                        <Eye size={17}/>
                      </button>
                      <span className="tooltip-text">View</span>
                    </div>
                  </td>
                </tr>

              ))
            }

            {
              highRisk.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color:"var(--ink-muted)" }}>
                    No high-risk customers right now.
                  </td>
                </tr>
              )
            }

          </tbody>

        </table>

      </div>

    </div>

  );

}
