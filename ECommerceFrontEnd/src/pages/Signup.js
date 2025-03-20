import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/api";
import "bootstrap/dist/css/bootstrap.min.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError,setPasswordError] = useState("");
  const [nameError,setNameError] = useState("");
  const [emailError,setEmailError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(""); 
    setError("");
    setNameError("");
    setEmailError("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;

    if(name.trim() === '')
    {
      setNameError("Name cannot be Empty Spaces");
      return;
    }

    if(email.trim() === '' && !emailRegex.test(email))
    {
      setEmailError("Enter valid Email Id");
      return;
    }

    if (password !== confirmPassword) 
      {
      setPasswordError("Passwords do not match.");
      return;
    }

    if(password.length < 6)
    {
      setPasswordError("Password must atleast contain 6 characters");
      return;
    }

    if(!/[A-Z]/.test(password))
    {
      setPasswordError("Password need to have atleast one Upper case letter");
      return;
    }

    if(!/[a-z]/.test(password))
    {
      setPasswordError("Password must contain atleast one Lower case letter");
      return;
    }

    if(!/[0-9]/.test(password))
    {
      setPasswordError("Password must contain atleast one Digit");
      return;
    }

    if(!/[!@#$%^&*]/.test(password))
    {
      setPasswordError("Password must contain atleast one Special Character");
      return;
    }

    if(password.includes(' '))
    {
      setPasswordError("Password cannot contain Space");
      return;
    }

    try {
      const response = await axios.post("/signup", { name, email, password });
      localStorage.setItem("userToken", JSON.stringify(response.data));
      navigate("/"); // Redirect to home page on success
    } catch (err) {
      if (err.response && err.response.data === "Credentails exists Please Login in") {
        navigate("/login", { state: { error: "User already exists. Please log in!" } });
      } else {
        setError(err.response?.data || "Signup failed. Try again.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center">Sign Up</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            {nameError && <small className="text-danger">{nameError}</small>}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {emailError && <small className="text-danger">{emailError}</small>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {passwordError && <small className="text-danger">{passwordError}</small>}
          </div>
          <button type="submit" className="btn btn-success w-100">Sign Up</button>
        </form>
        <p className="text-center mt-3">
          Existing user? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
