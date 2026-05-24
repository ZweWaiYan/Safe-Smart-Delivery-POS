import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from '../../api/authAPI';

import toast from "react-hot-toast";

export function SignIn() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    userName: "",
    userPassword: "",
  });

  const [error, setError] = useState("");

  const validate = () => {
    let valid = true;
    const newErrors = { userName: "", userPassword: "" };

    if (!phone.trim()) {
      newErrors.userName = "Name is required";
      valid = false;
    }
    if (!password.trim()) {
      newErrors.userPassword = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (!validate()) return;

      const res = await login(phone, password);
   
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("routes", JSON.stringify(res.data.user.routes));
        navigate("/dashboard/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Prefer backend message if available      
      setError(err.toString());
    }
  };



  return (
    <section className="flex items-center justify-center h-screen w-screen bg-white">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your phone and password to Sign In.
          </Typography>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg"
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Phone
            </Typography>
            <div>
              <Input
                size="lg"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              {errors.userName && (
                <span className="text-red-500 text-xs">{errors.userName}</span>
              )}
            </div>
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Password
            </Typography>
            <div>
              <Input
                type="password"
                size="lg"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              {errors.userPassword && (
                <span className="text-red-500 text-xs">{errors.userPassword}</span>
              )}
            </div>
          </div>

          <div className="mt-5">
            {error && (
              <span className="text-red-500 text-md">{error}</span>
            )}
          </div>

          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
