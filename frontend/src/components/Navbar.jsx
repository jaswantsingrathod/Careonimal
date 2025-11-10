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

export default function Navbar() {
  const { isLoggedIn, handleLogout } = useContext(UserContext);

  return (
    <div className="w-full border-b shadow-sm bg-white px-6 py-3">
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-6">
          {/* Logo / Home */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/" className="font-semibold text-lg">
                 Careonimal🐾
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
              <Link to="/contact">Conatct</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/about">About Us</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/provider">Become A Provider</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>


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
                      handleLogout()
                    }}
                  >
                    Logout
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
