import LoginForm from "../components/auth/LoginForm";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-10">
          <h1 className="text-5xl font-bold">GAMESTOP</h1>
          <p className="mt-4 text-xl">
            Level Up Your Gaming Experience
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-white text-center">
            Welcome Back
          </h2>

          <p className="text-gray-400 text-center mt-2">
            Sign in to continue
          </p>
          <LoginForm />
          
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;