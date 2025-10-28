import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        <li className="dropdown">
          <span onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
            Services
          </span>

          {open && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/boarding">Boarding</Link>
              </li>
              <li>
                <Link to="/clinic">Veterinary Clinics</Link>
              </li>
              <li>
                <Link to="/groomers">Groomers</Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <Link to="/contact">Contact</Link>
        </li>

        <li>
          <Link to="/register">Login or Signup</Link>
          
        </li>
      </ul>
    </nav>
  );
}
