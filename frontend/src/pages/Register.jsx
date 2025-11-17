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
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">

      <h4 className="text-2xl  font-bold text-gray-800 mb-4">Register Here</h4>

      {serverError && (
        <p className="text-red-500 font-medium mb-2">{serverError}</p>
      )}

      <form
        onSubmit={formik.handleSubmit}
        className="w-full flex justify-center"
      >
        <div className="flex flex-col gap-3 p-6 w-full max-w-xs bg-white rounded-xl shadow-md border">

          <Input
            type="text"
            value={formik.values.username}
            name="username"
            onChange={formik.handleChange}
            placeholder="Enter Username"
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Input
            type="text"
            value={formik.values.email}
            name="email"
            onChange={formik.handleChange}
            placeholder="Enter Email"
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            placeholder="Enter Password"
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Input
            type="tel"
            value={formik.values.phone}
            name="phone"
            onChange={formik.handleChange}
            placeholder="Enter Number"
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Button
            type="submit"
            className="w-full py-2 text-base hover:bg-blue-700 text-white rounded-md shadow"
          >
            Register
          </Button>

        </div>
      </form>
    </div>
  );
}
