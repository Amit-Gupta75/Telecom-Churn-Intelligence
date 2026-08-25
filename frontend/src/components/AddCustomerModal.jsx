import { useState } from "react";
import { X } from "lucide-react";

export default function AddCustomerModal({ onClose, onCreate }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password,setPassword] = useState("");

  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      name,
      email,
      phone,
      password,
      location,
    });
  };

  return (
    <div className="modal-overlay">

      <div className="modal-card">

        <div className="modal-header">

          <div>
            <h2>Add Customer</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>


        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>


          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">

            <label>Password</label>

            <input

            type="password"

            value={password}

            onChange={(e)=>setPassword(e.target.value)}

            required

            />

          </div>


          <div className="form-group">
            <label>Phone</label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>


          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>


          <div className="modal-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Customer
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}