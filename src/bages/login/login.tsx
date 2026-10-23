import {
  Alert,
  Button,
  FieldError,
  Input,
  Spinner,
  TextField,
} from "@heroui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type loginSchemaType,
} from "../../lib/Schemas/Auth.Schemas";
import { loginUser } from "../../Services/Outhservices";
import axios from "axios";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Tokencontext } from "../../commponents/context/Tokencontext";


export default function Login() {
  const [sucessMessage, setsucessMessage] = useState("");
  const [errorMessage, seterrorMessage] = useState("");
  const navigate = useNavigate();
  const {setToken} = useContext(Tokencontext)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginSchemaType>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      
    },
  });
  async function sumbitData(values: loginSchemaType) {
    console.log(values);
    seterrorMessage("");
    setsucessMessage("");
    try {
      const response = await loginUser(values);
      console.log(response);
      console.log(response.data.data.token);
       


      localStorage.setItem("userToken" , response.data.data.token)
      
      setToken(response.data.data.token)
      console.log(response.data.message);
      // setsucessMessage(response.data.message);
      toast.success(response.data.message, {
        duration: 4000,
        position: "top-right",
        // style:{backgroundColor:"red" , color : "white"},
      });


      setTimeout(() => {
        
        navigate("/");

      }, 1500);
      


    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.message);
        // seterrorMessage(error.response?.data?.message);
        toast.error(error.response?.data?.message);
      }
    }
  }

  return (
    <>
      <main>
        <section className="max-w-2xl">
          <h1 className="text-4xl font-black text-main p-10">
            Log in to Route Posts 
          </h1>
          <p className="py-6 font-lg">Log in and continue your social journey.</p>
          {sucessMessage && (
            <>
              {" "}
              <Alert status="success" className="bg-green-200">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{sucessMessage}</Alert.Title>
                </Alert.Content>
              </Alert>
            </>
          )}
          {errorMessage && (
            <>
              {" "}
              <Alert status="danger" className="bg-red-200">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{errorMessage}</Alert.Title>
                </Alert.Content>
              </Alert>
            </>
          )}
          <form className="space-y-5 pt-4" onSubmit={handleSubmit(sumbitData)}>
           


            <TextField
              aria-label="Email"
              className="w-full"
              isInvalid={Boolean(errors.email)}
            >
              <Input
                {...register("email")}
                aria-label="Email"
                type="email"
                className="w-full rounded-md"
                placeholder="Email address"
              />
              <FieldError>{errors.email?.message}</FieldError>
            </TextField>
           

           
            <TextField
              aria-label="password"
              className="w-full"
              isInvalid={Boolean(errors.password)}
            >
              <Input
                {...register("password")}
                aria-label="password"
                type="password"
                className="w-full rounded-md"
                placeholder="password"
              />
              <FieldError>{errors.password?.message}</FieldError>
            </TextField>
           
            <Button type="submit" className="bg-main rounded-md w-full">
              {isSubmitting ? (
                <div className="flex gap-2">
                  <Spinner className="text-white" /> <p>loading....</p>
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
