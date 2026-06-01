import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar, Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useNavigate } from "react-router-dom";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;

  const navigate = useNavigate();
  ``
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} h-full w-25 rounded-xl border flex flex-col justify-around border-blue-gray-100`}
    >
      <div className="m-3">
        {routes.map(({ layout, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-2">
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? "gray"
                          : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                      }
                      className="flex items-center gap-2 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      {name}
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div>
        <div className="m-2">
          <Button
            color="blue"
            className="flex justify-center items-center gap-2 px-4 capitalize"
            fullWidth
            onClick={() => {
              localStorage.removeItem('token'); // remove JWT token        
              alert("You’ve been logged out. You can now close this tab.");
              navigate("/auth/sign-in")
            }}
          >
            Logout
          </Button>
        </div>
        <div className="flex justify-center mt-3">
          <Typography
            variant="small"
            color="blue-gray"
            className="mb-2 font-normal"
          >
            Version 1.0.0 + 11
          </Typography>
        </div>
      </div>
    </aside >
  );
}
