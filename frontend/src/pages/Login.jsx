import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFormik } from "formik";
import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";

export default function Login() {

    const { handleLogin, serverError, userDispatch} = useContext(UserContext)

    const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values, { resetForm }) => {
      console.log("FormData", values);
      handleLogin(values, resetForm);
    },
  });

  useEffect(() => {
      userDispatch({ type: "CLEAR_ERROR" });
    }, []);

  return (
    <div>
      <h2>Login Here!</h2>
      {serverError && (<p className="text-red-500">{serverError}</p>)}
      <form onSubmit={formik.handleSubmit} className="flex w-full items-center gap-2">
        <div>
            <Input 
            type="text"
            placeholder="Enter Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            />
        </div>
        <div>
            <Input 
            type="text" 
            placeholder="Enter Password" 
            value={formik.values.password}
            name="password"
            onChange={formik.handleChange}
            />
        </div>
        <div>
            <Button type="submit">Login</Button>
        </div>
      </form>
        <ul>
          <li>
            <Link to="/register">Don't have an Account?  Register</Link>
          </li>
        </ul>
    </div>
  );
}
