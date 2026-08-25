import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import CustomerTable from "../components/CustomerTable.jsx";
import Loading from "../components/Loading.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import AddCustomerModal from "../components/AddCustomerModal";
import {useAuth} from "../context/AuthContext";

import {
  getCustomers,
  createCustomer,
  deleteCustomer,
} from "../services/api.js";


export default function Customers() {

  const [showAddModal,setShowAddModal]=useState(false);

  const [showConfirm,setShowConfirm] = useState(false);
  const [selectedCustomer,setSelectedCustomer] = useState(null);
  const [deleting,setDeleting] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);


  const load = async () => {

  try {

    setLoading(true);

    const data = await getCustomers();

    setCustomers(data);

  } catch(error) {

    console.error(
      "Customer loading failed:",
      error
    );

  } finally {

    setLoading(false);

  }

};

  useEffect(()=>{

    load();

    },[]);


  useEffect(() => {

  setLoading(true);

  getCustomers()
    .then(setCustomers)
    .catch((error) => {
      console.error("Failed to load customers", error);
    })
    .finally(() => {
      setLoading(false);
    });

}, []);



  const quickAdd = async (e) => {

    e.preventDefault();

    if (!name.trim()) return;


    await createCustomer({

      name,

      location,

      tenure: 0,

      monthlyCharges: 0,

      totalCharges: 0,

      contract: "Month-to-month"

    });


    setName("");
    setLocation("");

    setShowForm(false);

    load();

  };


  const handleAddCustomer = async(data)=>{


    try{


    await createCustomer(data);


    setShowAddModal(false);


    load();


    }
    catch(error){

    console.log(error);

    }

    };


  // DELETE CUSTOMER
  const handleDelete = async()=>{

        try{

        setDeleting(true);

        await deleteCustomer(
          selectedCustomer
        );


        getCustomers()
        .then(setCustomers);

        }
        catch(error){

        console.error(
          "Delete failed:",
          error
        );

        alert(
          "Unable to delete customer"
        );

        }
        finally{

        setDeleting(false);

        setShowConfirm(false);

        setSelectedCustomer(null);

        }

        };



  return (

    <div>


      <header
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"flex-end",
          marginBottom:22
        }}
      >

        <div>

          <div className="eyebrow">
            Customers
          </div>


          <h1
            style={{
              fontSize:26,
              marginTop:4
            }}
          >
            All customers
          </h1>

        </div>


        <button
          className="btn btn-primary"
          onClick={()=>setShowAddModal(true)}
        >

          <UserPlus size={16}/>

          Add customer

        </button>


      </header>



      {
        showForm && (

          <form
            onSubmit={quickAdd}
            className="card"
            style={{
              padding:16,
              marginBottom:18,
              display:"flex",
              gap:10
            }}
          >


            <input

              value={name}

              onChange={(e)=>
                setName(e.target.value)
              }

              placeholder="Customer name"

              required

              style={{
                flex:2,
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:8
              }}

            />



            <input

              value={location}

              onChange={(e)=>
                setLocation(e.target.value)
              }

              placeholder="Location (optional)"

              style={{
                flex:1,
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:8
              }}

            />



            <button
              type="submit"
              className="btn btn-primary"
            >
              Save
            </button>


          </form>

        )
      }




      {
        loading

        ?

        <Loading />

        :

        <CustomerTable

        customers={customers}

        onDelete={(id)=>{

          console.log("Delete clicked:", id);

          setSelectedCustomer(id);

          setShowConfirm(true);

        }}

        />
      }
          {
          showConfirm && (

          <ConfirmModal

          message="Are you sure you want to delete this customer?"

          loading={deleting}

          onCancel={()=>{

          setShowConfirm(false);

          setSelectedCustomer(null);

          }}

          onConfirm={handleDelete}

          />

          )
          }

          {
          showAddModal && (

          <AddCustomerModal

          onClose={()=>setShowAddModal(false)}

          onSave={handleAddCustomer}

          />

          )
          }

    </div>

  );

}