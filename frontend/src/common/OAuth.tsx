import { Button } from "@/components/ui/button";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { signIn } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Default role is "MENTEE"
  const role = "MENTEE";

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      const res = await fetch(`/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
          role: role, // Sending the default role
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(signIn(data));
        navigate("/");
      } else {
        return toast.error(data.msg);
      }
    } catch (error) {
      return toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        color="primary"
        onClick={handleGoogleClick}
        className="flex items-center gap-2 w-full"
      >
        <AiFillGoogleCircle className="w-6 h-6" />
        Continue with Google
      </Button>
    </div>
  );
};

export default OAuth;
