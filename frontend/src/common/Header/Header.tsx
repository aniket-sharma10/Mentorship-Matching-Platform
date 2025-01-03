import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { signOut } from "../../redux/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  const getLinkClass = (path: string): string => {
    return location.pathname === path ? "text-teal-500" : "";
  };

  const handleSignout = async (): Promise<void> => {
    try {
      const res = await fetch(`/api/auth/logout`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOut());
        toast.success("Signed out successfully!");
      } else {
        toast.error(data.msg || "Logout failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm relative">
      <Link
        to="/"
        className="text-lg sm:text-xl font-bold font-serif text-blue-600"
      >
        MentorMatch
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex space-x-4">
        <Link
          to="/"
          className={`hover:text-teal-500 text-base ${getLinkClass("/")}`}
        >
          Home
        </Link>
        <Link
          to="/matchmaking"
          className={`hover:text-teal-500 text-base ${getLinkClass(
            "/matchmaking"
          )}`}
        >
          Matchmaking
        </Link>
        <Link
          to="/discovery"
          className={`hover:text-teal-500 text-base ${getLinkClass(
            "/discovery"
          )}`}
        >
          Discovery
        </Link>
        <Link
          to="/about"
          className={`hover:text-teal-500 text-base ${getLinkClass("/about")}`}
        >
          About Us
        </Link>
      </div>

      {/* Hamburger Menu for Smaller Screens */}
      <div className="md:hidden flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <DropdownMenuItem asChild>
              <Link
                to="/"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/matchmaking"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Matchmaking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/discovery"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Discovery
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/about"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                About Us
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                {currentUser?.avatarUrl ? (
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name || "User"}
                  />
                ) : (
                  <AvatarFallback>
                    {currentUser.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/connections">Connections</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/signin">
            <Button
              variant="outline"
              className="text-pink-600 border-pink-600 hover:bg-pink-50"
            >
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Header;
