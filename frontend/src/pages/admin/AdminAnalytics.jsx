import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Dashboard from "../../components/Dashboard.jsx";
import Loading from "../../components/Loading.jsx";
import { getCustomers, getStats } from "../../services/api";


export default function AdminAnalytics(){

  const navigate = useNavigate();

  const [customers,setCustomers] = useState([]);
  const [trendHistory,setTrendHistory] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);


  const load = useCallback(async()=>{

    try{

      const [custs,stats] = await Promise.all([getCustomers(),getStats()]);
      setCustomers(custs);
      setTrendHistory(stats?.trendHistory ?? []);
      setError(null);

    }catch{

      setError("Could not load analytics data.");

    }
    finally{

      setLoading(false);

    }

  },[]);


  useEffect(()=>{ load(); },[load]);


  return (

    <div>

      {loading && <Loading label="Loading analytics…" />}

      {error && <p style={{ color:"var(--risk-high)", fontSize:13.5 }}>{error}</p>}

      {
        !loading && !error && (
          <Dashboard
            customers={customers}
            trendHistory={trendHistory}
            onRefresh={load}
            onViewAll={()=>navigate("/admin/customers")}
            onViewCustomer={(id)=>navigate(`/admin/customers/${id}`)}
          />
        )
      }

    </div>

  );

}
