import { useState } from "react";
import Navbar from "./Navbar.jsx";

export default function Layout({children}) {

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
        {children}
      </main>


    </div>

  );

}