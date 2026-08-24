import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout(){

return (

<div className="app-shell">

<aside className="sidebar">


<h2 style={{color:"white"}}>
Admin Panel
</h2>


<nav
style={{
display:"flex",
flexDirection:"column",
gap:15
}}
>


<NavLink to="/admin">
Dashboard
</NavLink>


<NavLink to="/admin/customers">
Customers
</NavLink>


<NavLink to="/admin/employees">
Employees
</NavLink>


<NavLink to="/admin/settings">
Settings
</NavLink>


</nav>


</aside>


<main className="main-area">

<Outlet />

</main>


</div>

);

}