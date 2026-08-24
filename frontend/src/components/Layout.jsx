import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {

  const [open,setOpen] = useState(true);

  return (

    <div className="app-shell">

      <Navbar
        open={open}
        setOpen={setOpen}
      />


      <main
        className={
          open
          ? "main-area"
          : "main-area expanded"
        }
      >
        <Outlet />
      </main>


    </div>

  );

}