import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError } from "../../utils";
import ScrollLock from "../../components/ScrollLock";

const Login = () => {
  const [loginInfo, setLoinInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const copyLogiInfo = { ...loginInfo }; // <-- shallow copy of the state object to avoid mutating the original state directly
    copyLogiInfo[name] = value;
    setLoinInfo(copyLogiInfo);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("All fields required");
    }
    try {
      const url = `${import.meta.env.VITE_BASE_API_URL}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      const { success, message, jwtToken, name, username, error, role, id, redirectTo } =
        result;
      if (success) {
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("name", name);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", String(id));
        localStorage.setItem("username", username);
        sessionStorage.setItem("pendingToast", `Authenticated as ${name}`);
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
        className="bg-white p-8 px-12 rounded-xl w-full max-w-sm shadow-[8px_8px_24px_0px_rgba(66,68,90,1)] mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-5">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-2.5">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-xl">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter Your Email..."
              value={loginInfo.email}
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
              value={loginInfo.password}
              className="w-full text-xl p-2.5 border-0 outline-none border-b border-black placeholder:text-xs placeholder:italic"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1877f2] border-0 text-xl text-white rounded-md py-2.5 cursor-pointer my-2.5"
          >
            Login
          </button>
          <span>
            Don't have an account ? <Link to="/signup">Signup</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
