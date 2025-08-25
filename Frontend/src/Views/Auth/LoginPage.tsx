import axios from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";

type Inputs = {
  email: string;
  password: string;
};

type Props = {};

function LoginPage({}: Props) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        data
      );
      navigate("/home");
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input {...register("email")} type="text" placeholder="Email" />
        <input {...register("password")} type="text" placeholder="Password" />
        <button>Log in</button>
      </form>
    </div>
  );
}

export default LoginPage;
