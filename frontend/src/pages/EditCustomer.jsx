import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CustomerForm from "../components/CustomerForm.jsx";
import { getCustomer, updateCustomer } from "../services/api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function EditCustomer(){

  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirm,setShowConfirm] = useState(false);

  const [customer,setCustomer] = useState(null);
  const [saving,setSaving] = useState(false);



  useEffect(()=>{

    getCustomer(id)
    .then((data)=>{

      setCustomer(data);

    });

  },[id]);



  const saveCustomer = async(form)=>{

    try{

      setSaving(true);

      await updateCustomer(id,form);

      alert("Customer updated successfully");

      navigate(`/customers/${id}`);

    }
    catch(error){

      console.log(error);

      alert("Failed to update customer");

    }
    finally{

      setSaving(false);

    }

  };



  if(!customer){

    return (
      <div>
        Loading customer...
      </div>
    );

  }



  return (

    <div className="edit-page">

      <button
        className="back-btn"
        onClick={()=>navigate(-1)}
      >
        ← Back
      </button>


      <h1>
        Edit Customer
      </h1>


      <CustomerForm

        customer={customer}

        setCustomer={setCustomer}

        onSubmit={(form)=>{

                            setCustomer(form);

                            setShowConfirm(true);

                            }}

        loading={saving}

        mode="edit"

      />

      {
        showConfirm && (

        <ConfirmModal

        message="Are you sure you want to update customer?"

        loading={saving}

        onCancel={()=>setShowConfirm(false)}

        onConfirm={()=>{

        setShowConfirm(false);

        saveCustomer(customer);

        }}

        />

        )
        }


    </div>

  );

}