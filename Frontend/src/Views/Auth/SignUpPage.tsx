import axios from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";

type Inputs = {
  email: string;
  password: string;
};

type Props = {};

function SignUpPage({}: Props) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);

    try {
      const signUpResponse = await axios.post(
        "http://localhost:3000/auth/signup",
        data
      );
      console.log(signUpResponse);

      const loginResponse = await axios.post(
        "http://localhost:3000/auth/login",
        data
      );

      console.log("loginRespose:", loginResponse);
      navigate("/home");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input {...register("email")} type="text" placeholder="Email" />
        <input {...register("password")} type="text" placeholder="Password" />
        <button>Sign up</button>
      </form>
    </div>
  );
}

export default SignUpPage;
