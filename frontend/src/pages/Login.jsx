import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck } from "lucide-react";


export default function Login(){

const navigate = useNavigate();

const { login } = useAuth();


const [form,setForm] = useState({
email:"",
password:""
});


const [error,setError] = useState("");

const [loading,setLoading] = useState(false);



const update = (key) => (e) => {

setForm({
  ...form,
  [key]: e.target.value
});

};



const submit=async(e)=>{

e.preventDefault();

try{

setLoading(true);
setError("");

const data = await loginUser(form);


login(data);



if(data.user.role==="admin"){

  navigate("/admin");

}
else if(data.user.role==="employee"){

  navigate("/employee");

}
else{

  navigate("/");

}

}catch(err){

setError(
err.response?.data?.message ||
"Login failed"
);

}
finally{

setLoading(false);

}

};



return (

<div
style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"var(--bg)"
}}
>


<form
onSubmit={submit}
className="card"
style={{
width:380,
padding:30
}}
>


<div
style={{
display:"flex",
alignItems:"center",
gap:10,
marginBottom:25
}}
>

<ShieldCheck
size={30}
color="var(--signal-mid)"
/>

<h2>
Telecom Intelligence
</h2>

</div>



<div className="field">

<label>Email</label>

<input
type="email"
required
value={form.email}
onChange={update("email")}
/>

</div>



<div
className="field"
style={{
marginTop:15
}}
>

<label>Password</label>

<input
type="password"
required
value={form.password}
onChange={update("password")}
/>

</div>



{
error &&
<p
style={{
color:"var(--risk-high)",
marginTop:15
}}
>
{error}
</p>
}



<button
className="btn btn-primary"
style={{
width:"100%",
justifyContent:"center",
marginTop:25
}}
disabled={loading}
>

{
loading
?
"Signing in..."
:
"Login"
}

</button>


</form>


</div>

);

}