import { Link } from "react-router-dom";
import { useContext } from "react";
import UserContext from "@/context/User-Context";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import img from "../assets/careonimallogo.png";

export default function Navbar() {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);

  // If admin is logged in, show a compact admin bar (or return null to hide completely)
  if (user?.role === "admin") {
    return (
      <div className="w-full border-b border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white px-6 py-3 shadow-lg">
    <div className="max-w-6xl mx-auto flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <Link
          to="/adminDashboard"
          className="text-lg font-semibold tracking-wide hover:text-blue-400 transition"
        >
          Admin Panel
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-sm text-gray-300 hover:text-white hover:bg-white/10 transition"
          onClick={navigateToAdminSettings}
        >
          ⚙️ Settings
        </Button>

        <Button
          className="text-sm bg-red-600 hover:bg-red-700 transition"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  </div>
    );
  }

  // Normal navbar for non-admins
  return (
    <div className="w-full flex justify-center border-b shadow-sm bg-white px-6 py-2 font-medium">
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-8 max-w-6xl mx-auto">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/" className="flex items-center gap-2">
                {/* <img className="h-8 w-8" src={img} alt="Logo" />
                <span className="font-semibold">Careonimal</span> */}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Common links */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/contact">Contact</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/about">About Us</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/provider">Become a Provider</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <div className="ml-auto flex items-center gap-4">
            {/* Conditional links */}
            {!isLoggedIn ? (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/login">Sign In</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Button
                      onClick={() => {
                        handleLogout();
                      }}
                    >
                      Logout
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

// small helper — if you want a button that navigates to admin settings
function navigateToAdminSettings() {
  // keep it simple and avoid importing useNavigate inside top-level component
  window.location.href = "/admin/settings";
}
