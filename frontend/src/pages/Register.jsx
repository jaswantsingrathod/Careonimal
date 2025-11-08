import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";
import { useFormik } from "formik";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const { handleRegister, serverError, userDispatch } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      phone: "",
    },
    onSubmit: (values, { resetForm }) => {
      console.log("FormData", values);
      handleRegister(values, resetForm);
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <div>
      <h4>Register Page</h4>
      {serverError && <p className ="text-red-500">{serverError}</p>}
      <form
        onSubmit={formik.handleSubmit}
        className="flex w-full items-center gap-2"
      >
        <div className="">
          <Input
            type="text"
            value={formik.values.username}
            name="username"
            onChange={formik.handleChange}
            placeholder="Enter Username"
          />
        </div>
        <div>
          <Input
            type="text"
            value={formik.values.email}
            name="email"
            onChange={formik.handleChange}
            placeholder="Enter Email"
          />
        </div>
        <div>
          <Input
            type="text"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            placeholder="Enter Password"
          />
        </div>
        <div>
          <Input
            type="tel"
            value={formik.values.phone}
            name="phone"
            onChange={formik.handleChange}
            placeholder="Enter Number"
          />
        </div>
        <div>
          <Button type="submit">Register</Button>
        </div>
      </form>
    </div>
  );
}
