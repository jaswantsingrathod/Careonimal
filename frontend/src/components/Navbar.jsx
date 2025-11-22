import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "@/context/User-Context";
import img from "../assets/careonimallogo.png";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Helper to get dashboard path based on role
  const dashboardPath = () => {
    if (user?.role === "admin") return "/adminDashboard";
    if (user?.role === "provider") return "/provider/dashboard";
    return "/dashboard";
  };

  //  ADMIN NAVBAR 
  if (user?.role === "admin") {
    return (
      <nav className="w-[95%] fixed left-[30px] top-2 z-20 bg-neutral-600 rounded-lg text-neutral-200 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
            <Link
              to="/adminDashboard"
              className="text-lg font-bold tracking-wide hover:text-white transition"
            >
              Admin Panel
            </Link>
          {/* MOBILE */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6">
                <div className="flex flex-col gap-6">
                  <Link to="/adminDashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }}>
                    Logout
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    );
  }

  //  USER / PROVIDER NAVBAR — Fully Responsive
  return (
    <>
    <header className="w-[94%] rounded-lg backdrop-blur-md bg-gray-150  shadow-2xl fixed top-2 left-9  z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg font-semibold text-neutral-800">
            Careonimal
          </Link>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-6">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/contact">Contact</NavItem>
              <NavItem to="/about">About Us</NavItem>

              {/* Hide Become Provider for providers */}
              {user?.role !== "provider" && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) navigate("/login");
                        else navigate("/provider");
                      }}
                      className="relative text-sm text-neutral-700 hover:text-black transition 
                        after:absolute after:left-0 after:-bottom-1 after:h-[1.5px]
                        after:w-0 after:bg-neutral-900 after:transition-all after:duration-300
                        hover:after:w-full bg-transparent border-0 p-0"
                    >
                      Become a Provider
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT SIDE — DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <Button asChild variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">
              <Link to="/login">Sign In</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-neutral-700 hover:text-black"
              >
                <Link to={dashboardPath()}>Dashboard</Link>
              </Button>

              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* MOBILE MENU */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-neutral-800" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="p-6">
              <div className="flex flex-col text-lg gap-4">

                <Link to="/" onClick={() => setOpen(false)}>Home</Link>
                <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
                <Link to="/about" onClick={() => setOpen(false)}>About Us</Link>

                {user?.role !== "provider" && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      if (!isLoggedIn) navigate("/login");
                      else navigate("/provider");
                    }}
                  >
                    Become a Provider
                  </button>
                )}

                <div className="border-t pt-4 mt-2" />

                {!isLoggedIn ? (
                  <button onClick={() => { setOpen(false); navigate("/login"); }}>
                    Sign In
                  </button>
                ) : (
                  <>
                    <button onClick={() => { setOpen(false); navigate(dashboardPath()); }}>
                      Dashboard
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => { handleLogout(); setOpen(false); }}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <div className="h-5"></div>
    </>
  );
}

function NavItem({ to, children }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="relative text-sm text-neutral-700 hover:text-black transition 
            after:absolute after:left-0 after:-bottom-1 after:h-[1.5px]
            after:w-0 after:bg-neutral-900 after:transition-all after:duration-300
            hover:after:w-full"
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
