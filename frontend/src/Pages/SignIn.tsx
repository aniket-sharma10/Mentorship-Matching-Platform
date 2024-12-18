import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "@/redux/userSlice";
import { RootState } from "@/redux/store";
import OAuth from "@/common/OAuth";

// Define schema with zod
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SignInFormData = z.infer<typeof signInSchema>;

function SignIn() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<SignInFormData> = async (formData) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(signIn(data.user));
        toast.success("Signed in successfully!");
        navigate("/");
      } else {
        toast.error(data.msg || "Sign-in failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-xl mx-auto flex-col md:flex-row items-center justify-center">
        <div className="flex-1 flex flex-col items-center border border-gray-300 p-4  max-w-md min-h-[400px] rounded-lg">
          <h2 className="text-center mb-8 text-2xl sm:text-3xl md:text-4xl font-bold">
            Sign In to Your Account
          </h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex max-w-md flex-col gap-4 w-full p-3"
            >
              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Your email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Your password</Label>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} color="blue">
                {loading ? "Loading..." : "Sign In"}
              </Button>
              <OAuth />
            </form>
          </Form>
          <div>
            <span>Don’t have an account?</span>
            <Link to="/signup" className="text-blue-500 ml-2 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
