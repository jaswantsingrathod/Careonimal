import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "@/context/User-Context";
import { Settings, Menu } from "lucide-react";
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

  const dashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "provider") return "/provider/dashboard";
    return "/user/dashboard";
  };

  const profilePath = () => {
    if (user?.role === "admin") return "/admin/profile";
    if (user?.role === "provider") return "/provider/profile";
    return "/user/profile";
  };

  return (
    <>
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-6xl rounded-2xl border border-orange-100/70 bg-white/80 backdrop-blur-md shadow-[0_18px_45px_rgba(15,23,42,0.18)] items-center bg-gradient-to-b from-orange-50 to-whit">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="Careonimal"
                className="h-8 w-auto rounded-full bg-orange-50 p-[2px] border border-orange-100"
              />

              <div className="leading-none">
                <span className="text-lg font-semibold text-orange-600">
                  Careonimal
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
             </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* RIGHT SIDE — DESKTOP */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoggedIn ? (
              <Button
                asChild
                variant="outline"
                className="border-orange-200 text-orange-700 bg-white/70 hover:bg-orange-50 hover:border-orange-300 text-sm"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer px-3 py-2 rounded-xl bg-white/70 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 flex items-center gap-2 text-slate-700">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">
                      {user?.username || "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44 border border-orange-100 bg-white/95 shadow-lg"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to={profilePath()}
                      className="block px-2 py-1.5 text-sm rounded hover:bg-orange-50"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to={dashboardPath()}
                      className="block px-2 py-1.5 text-sm rounded hover:bg-orange-50"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <div className="px-1.5 py-1.5">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-rose-600 hover:bg-rose-50">
                          {/* <LogOut className="w-4 h-4" /> */}
                          <span>Logout</span>
                        </button>
                      </DialogTrigger>

                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold">
                            Logout?
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to logout from Careonimal?
                          </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>

                          <DialogClose asChild>
                            <Button
                              className="bg-rose-600 hover:bg-rose-700"
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
            )}

            {/* MOBILE: sheet trigger */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-orange-50"
                  >
                    <Menu className="h-6 w-6 text-slate-800" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="p-6 bg-gradient-to-b from-orange-50 via-white to-orange-50"
                >
                  <div className="flex flex-col gap-5 mt-4 text-slate-800">
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
                        className="text-left text-orange-600 font-medium"
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
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="font-medium text-orange-700"
                      >
                        Sign In
                      </Link>
                    ) : (
                      <>
                        {/* <Link
                          to={profilePath()}
                          onClick={() => setOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to={dashboardPath()}
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link> */}
                        <button
                          className="text-left text-rose-600 font-medium"
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
      <div className="h-1" />
    </>
  );
}

function NavItem({ to, children }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="relative text-sm text-slate-700 hover:text-orange-600 transition 
            after:absolute after:left-0 after:-bottom-1 after:h-[1.5px]
            after:w-0 after:bg-orange-500 after:transition-all after:duration-300
            hover:after:w-full"
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
