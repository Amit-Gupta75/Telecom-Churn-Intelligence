import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

import { getAllPredictions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading.jsx";


function riskBadge(prob) {
  if (prob >= 0.66) return <span className="badge badge-high">{Math.round(prob * 100)}% High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">{Math.round(prob * 100)}% Medium</span>;
  return <span className="badge badge-low">{Math.round(prob * 100)}% Low</span>;
}


export default function PredictionsList(){

  const navigate = useNavigate();
  const { user } = useAuth();
  const base = user?.role === "admin" ? "/admin" : "/employee";

  const [predictions,setPredictions] = useState([]);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    getAllPredictions()
      .then(setPredictions)
      .catch(()=>setPredictions([]))
      .finally(()=>setLoading(false));

  },[]);


  return (

    <div>

      <div className="eyebrow">Churn intelligence</div>
      <h1 style={{ fontSize:26, marginTop:4 }}>Predictions</h1>
      <p style={{ color:"var(--ink-muted)", marginTop:6 }}>
        Every churn score run across all customers.
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
                <th>Location</th>
                <th>Risk</th>
                <th>Run at</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {
                predictions.map((p)=>(

                  <tr key={p._id}>

                    <td style={{ fontWeight:600 }}>{p.customer?.name || "Deleted customer"}</td>
                    <td>{p.customer?.location || "-"}</td>
                    <td>{riskBadge(p.probability)}</td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>

                    <td>
                      {
                        p.customer?._id && (
                          <div className="tooltip">
                            <button
                              className="icon-btn view-icon"
                              onClick={()=>navigate(`${base}/customers/${p.customer._id}`)}
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
                predictions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ color:"var(--ink-muted)" }}>
                      No predictions have been run yet.
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
