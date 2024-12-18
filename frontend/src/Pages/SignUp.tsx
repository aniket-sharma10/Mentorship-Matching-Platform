import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import OAuth from "@/common/OAuth";

// Define your schema with zod
const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["MENTOR", "MENTEE"]), // Strict role types
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;


function SignUp() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {currentUser} = useSelector((state:RootState) => state.user)


  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: "MENTEE", // Default role is "MENTEE"
    },
  });



  const onSubmit: SubmitHandler<SignUpFormData> = async (formData) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registered successfully!");
        navigate("/signin");
      } else {
        console.log(data)
        toast.error(data.msg || "Registration failed");
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
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row items-center justify-center">
        <div className="flex-1 flex flex-col items-center border border-gray-300 p-4 max-w-xl rounded-lg">
          <h2 className="text-center mb-8 text-2xl sm:text-3xl md:text-4xl font-bold">
            Create Account
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
                      <Input id="email" type="email" placeholder="Enter your email" {...field} />
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
                      <Input id="password" type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Selection */}
              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="role">Select your role</Label>
                    <FormControl>
                      <select
                        id="role"
                        className="border rounded-md p-2 w-full"
                        {...field}
                      >
                        <option value="MENTEE">Mentee</option>
                        <option value="MENTOR">Mentor</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} color="blue">
                {loading ? "Loading..." : "Create New Account"}
              </Button>
              <OAuth />
            </form>
          </Form>
          <div>
            <span>Already have an account?</span>
            <Link to="/signin" className="text-blue-500 ml-2 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
