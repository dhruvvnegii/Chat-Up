import React, { useState, useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [dataSubmitted, setDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (currState === "Sign Up" && !dataSubmitted) {
      setDataSubmitted(true);
      return;
    }

    if (currState === "Sign Up") {
      login("signup", { fullName, email, password, bio });
    } else {
      login("login", { email, password });
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* Left Section */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vh,250px)]" />

      {/* Right Section */}
      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        {/* Header */}
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {currState === "Sign Up" && dataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="back"
              className="w-5 cursor-pointer"
              onClick={() => setDataSubmitted(false)}
            />
          )}
        </h2>

        {/* Step 1: Sign Up form */}
        {currState === "Sign Up" && !dataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Full Name"
            required
          />
        )}

        {!dataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </>
        )}

        {/* Step 2: Bio */}
        {currState === "Sign Up" && dataSubmitted && (
          <textarea
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short bio..."
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign Up"
            ? dataSubmitted
              ? "Finish Sign Up"
              : "Create Account"
            : "Login Now"}
        </button>

        {/* Terms & Conditions */}
        {!dataSubmitted && currState === "Sign Up" && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" required />
            <p>Agree to terms of use & privacy policy.</p>
          </div>
        )}

        {/* Switch between login/signup */}
        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <span
                onClick={() => setCurrState("Sign Up")}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Sign up here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
