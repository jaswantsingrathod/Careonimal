import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "@/context/User-Context";
import img from "../assets/careonimallogo.png";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);
  const navigate = useNavigate();

  // ADMIN NAVBAR — darker & premium
  if (user?.role === "admin") {
    return (
      <header className="w-full backdrop-blur-lg bg-neutral-950/90 border-b border-neutral-800 px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-neutral-200">

          {/* LEFT — Logo + Admin Panel */}
          <div className="flex items-center gap-3">
            <img src={img} alt="Logo" className="h-7 w-7 object-contain" />
            <Link
              to="/adminDashboard"
              className="text-lg font-semibold tracking-wide hover:text-white transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // USER NAVBAR — light & transparent
  return (
    <header className="w-full backdrop-blur-md bg-white/80 border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={img} alt="Logo" className="h-8 w-8 object-contain" />
          <Link to="/" className="text-lg font-semibold text-neutral-800">
            Careonimal
          </Link>
        </div>

        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/contact">Contact</NavItem>
            <NavItem to="/about">About Us</NavItem>

            {/* Become a Provider — custom handler */}
            {user?.role !== "provider" && (
              <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <button
                  onClick={() => {
                    // if not logged in → go to register, else go to become-provider
                    if (!isLoggedIn) navigate("/login");
                    else navigate("/provider");
                  }}
                  className="
                    relative text-sm text-neutral-700 hover:text-black transition 
                    after:absolute after:left-0 after:-bottom-1 after:h-[1.5px]
                    after:w-0 after:bg-neutral-900 after:transition-all after:duration-300
                    hover:after:w-full
                    bg-transparent border-0 p-0
                  "
                >
                  Become a Provider
                </button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <Button
              asChild
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-neutral-700 hover:text-black"
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="
            relative text-sm text-neutral-700 hover:text-black transition 
            after:absolute after:left-0 after:-bottom-1 after:h-[1.5px]
            after:w-0 after:bg-neutral-900 after:transition-all after:duration-300
            hover:after:w-full
          "
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
