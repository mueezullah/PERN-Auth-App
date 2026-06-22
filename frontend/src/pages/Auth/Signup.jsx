import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils";
import ScrollLock from "../../components/ScrollLock";

const Signup = () => {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copySignupInfo = { ...signupInfo }; // <-- shallow copy of the state object to avoid mutating the original state directly
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { name, username, email, password } = signupInfo;
    if (!name || !username || !email || !password) {
      return handleError("All fields required");
    }
    try {
      const url = `${import.meta.env.VITE_BASE_API_URL}/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupInfo),
      });

      const result = await response.json();
      const { success, message, error, jwtToken, role, name: returnedName, username: returnedUsername, id, redirectTo } =
        result;

      if (success) {
        localStorage.setItem("name", returnedName);
        localStorage.setItem("username", returnedUsername);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", String(id));
        sessionStorage.setItem("pendingToast", `authenticated as ${name}`);
        navigate(redirectTo);
      } else if (error) {
        handleError(error);
      } else if (!success) {
        handleError(message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm cursor-pointer"
      onClick={() => navigate("/")}
    >
      <ScrollLock />
      <div
        className="bg-white p-8 px-12 rounded-xl w-full max-w-sm shadow-[8px_8px_24px_0px_rgba(66,68,90,1)] mx-auto relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-5">SignUp</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-2.5">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-xl">
              Name
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter Name"
              value={signupInfo.name}
              className="w-full text-xl p-2.5 border-0 outline-none border-b border-black placeholder:text-xs placeholder:italic"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="username" className="text-xl">
              Username
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="username"
              placeholder="Enter Unique Username"
              value={signupInfo.username}
              className="w-full text-xl p-2.5 border-0 outline-none border-b border-black placeholder:text-xs placeholder:italic"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-xl">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter Your Email..."
              value={signupInfo.email}
              className="w-full text-xl p-2.5 border-0 outline-none border-b border-black placeholder:text-xs placeholder:italic"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="text-xl">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter Password..."
              value={signupInfo.password}
              className="w-full text-xl p-2.5 border-0 outline-none border-b border-black placeholder:text-xs placeholder:italic"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1877f2] border-0 text-xl text-white rounded-md py-2.5 cursor-pointer my-2.5"
          >
            Signup
          </button>
          <span>
            Already have an account ? <Link to="/login">Login</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
