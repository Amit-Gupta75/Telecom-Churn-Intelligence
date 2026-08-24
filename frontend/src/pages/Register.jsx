import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { ShieldCheck } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser(form);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <form
        onSubmit={submit}
        className="card"
        style={{
          width: 380,
          padding: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 25,
          }}
        >
          <ShieldCheck
            size={30}
            color="var(--signal-mid)"
          />

          <h2>
            Create Account
          </h2>
        </div>

        {/* Name */}
        <div className="field">
          <label>Name</label>

          <input
            type="text"
            required
            value={form.name}
            onChange={update("name")}
          />
        </div>

        {/* Email */}
        <div
          className="field"
          style={{
            marginTop: 15,
          }}
        >
          <label>Email</label>

          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
          />
        </div>

        {/* Password */}
        <div
          className="field"
          style={{
            marginTop: 15,
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

        {/* Role */}
        <div
          className="field"
          style={{
            marginTop: 15,
          }}
        >
          <label>Role</label>

          <select
            value={form.role}
            onChange={update("role")}
          >
            <option value="employee">
              Employee
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              color: "var(--risk-high)",
              marginTop: 15,
            }}
          >
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p
            style={{
              color: "green",
              marginTop: 15,
            }}
          >
            {success}
          </p>
        )}

        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: 25,
          }}
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Register"}
        </button>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            style={{
              cursor: "pointer",
              color: "var(--signal-mid)",
              fontWeight: 600,
            }}
          >
            Login
          </span>
        </p>

      </form>
    </div>
  );
}