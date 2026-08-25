import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

import { getAllInteractions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading.jsx";


const severityBadge = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low"
};


export default function InteractionsList(){

  const navigate = useNavigate();
  const { user } = useAuth();
  const base = user?.role === "admin" ? "/admin" : "/employee";

  const [interactions,setInteractions] = useState([]);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    getAllInteractions()
      .then(setInteractions)
      .catch(()=>setInteractions([]))
      .finally(()=>setLoading(false));

  },[]);


  return (

    <div>

      <div className="eyebrow">Customer engagement</div>
      <h1 style={{ fontSize:26, marginTop:4 }}>Interactions</h1>
      <p style={{ color:"var(--ink-muted)", marginTop:6 }}>
        Complaints, visits and billing touchpoints across all customers.
      </p>

      {
        loading
        ?
        <Loading />
        :
        <div className="card" style={{ marginTop:20, padding:20, overflowX:"auto" }}>

          <table>

            <thead>
              <tr>
                <th>Customer</th>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {
                interactions.map((i)=>(

                  <tr key={i._id}>

                    <td style={{ fontWeight:600 }}>{i.customer?.name || "Deleted customer"}</td>
                    <td>{i.title}</td>
                    <td style={{ textTransform:"capitalize" }}>{i.type.replace("_"," ")}</td>
                    <td>
                      <span className={`badge ${severityBadge[i.severity] || "badge-medium"}`}>
                        {i.severity}
                      </span>
                    </td>
                    <td>{new Date(i.occurredAt).toLocaleDateString()}</td>

                    <td>
                      {
                        i.customer?._id && (
                          <div className="tooltip">
                            <button
                              className="icon-btn view-icon"
                              onClick={()=>navigate(`${base}/customers/${i.customer._id}`)}
                            >
                              <Eye size={17}/>
                            </button>
                            <span className="tooltip-text">View customer</span>
                          </div>
                        )
                      }
                    </td>

                  </tr>

                ))
              }

              {
                interactions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ color:"var(--ink-muted)" }}>
                      No interactions logged yet.
                    </td>
                  </tr>
                )
              }

            </tbody>

          </table>

        </div>
      }

    </div>

  );

}
