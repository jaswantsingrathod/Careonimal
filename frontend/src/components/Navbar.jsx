import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "@/context/User-Context";
import { LogOut, Settings, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/* shadcn DropdownMenu imports */
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import logo from "../assets/careonimal.loggo.png";

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

  // Helper to get profile path based on role
  const profilePath = () => {
    if (user?.role === "admin") return "/admin/profile";
    if (user?.role === "provider") return "/provider/profile";
    return "/user/profile";
  };

  return (
    <>
      <header className="w-[94%] rounded-lg font-semibold backdrop-blur-md bg-gray-150 shadow-2xl fixed top-2 left-9 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          {/* LOGO */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Careonimal" className="h-8 w-auto" />

              {/* 𝓒𝓪𝓻𝓮𝓸𝓷𝓲𝓶𝓪𝓵 */}
              <div>
                <span className="text-lg font-semibold text-orange-600">
                𝓒𝓪𝓻𝓮
              </span>
              <span className="text-lg font-semibold text-orange-500">𝓸</span>
              <span className="text-lg font-semibold text-orange-600">
                𝓷𝓲𝓶𝓪𝓵
              </span>
              </div>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-6">
                <NavItem to="/">Home</NavItem>
                <NavItem to="/contact">Contact</NavItem>
                <NavItem to="/about">About Us</NavItem>

                {/* Become a Provider: show only to users who are NOT provider and NOT admin */}
                {user?.role !== "provider" && user?.role !== "admin" && (
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
                        Offer Pet Care
                      </button>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* RIGHT SIDE — DESKTOP (always visible) */}
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
                {/* Settings dropdown using shadcn DropdownMenu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer px-3 py-2 rounded-md hover:bg-slate-50 flex items-center gap-2">
                      <Settings />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link
                        to={profilePath()}
                        className="block px-2 py-1 text-sm hover:bg-neutral-100 rounded"
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to={dashboardPath()}
                        className="block px-2 py-1 text-sm hover:bg-neutral-100 rounded"
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin: also show admin-specific links (if desired) */}
                    {/* {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/adminDashboard"
                          className="block px-2 py-1 text-sm hover:bg-neutral-100 rounded"
                        >
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )} */}

                    {/* Logout inside the dropdown */}
                    <div className="px-2 py-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md text-red-600 hover:bg-slate-50">
                            <span>Logout</span>
                          </button>
                        </DialogTrigger>

                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">
                              Logout?
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to logout?
                            </DialogDescription>
                          </DialogHeader>

                          <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>

                            <DialogClose asChild>
                              <Button
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleLogout}
                              >
                                Logout
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* MOBILE: sheet trigger */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6 text-black" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="p-6">
                  <div className="flex flex-col gap-6">
                    <Link to="/" onClick={() => setOpen(false)}>
                      Home
                    </Link>
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      Contact
                    </Link>
                    <Link to="/about" onClick={() => setOpen(false)}>
                      About
                    </Link>

                    {user?.role !== "provider" && user?.role !== "admin" && (
                      <button
                        onClick={() => {
                          setOpen(false);
                          if (!isLoggedIn) navigate("/login");
                          else navigate("/provider");
                        }}
                      >
                        Offer Pet Care
                      </button>
                    )}

                    {!isLoggedIn ? (
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Sign In
                      </Link>
                    ) : (
                      <>
                        {/* <Link to={profilePath()} onClick={() => setOpen(false)}>
                          Profile
                        </Link> */}
                        {/* <Link
                          to={dashboardPath()}
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link> */}
                        {user?.role === "admin" && (
                          <Link
                            to="/adminDashboard"
                            onClick={() => setOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
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
