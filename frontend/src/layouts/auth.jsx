import { Routes, Route, Navigate } from "react-router-dom";
import {
  ChartPieIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
// import { Navbar, Footer } from "@/widgets/layout";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";

export function Auth() {
  const navbarRoutes = [
    {
      name: "dashboard",
      path: "/dashboard/home",
      icon: ChartPieIcon,
    },
    {
      name: "profile",
      path: "/dashboard/home",
      icon: UserIcon,
    },
    {
      name: "sign in",
      path: "/auth/sign-in",
      icon: ArrowRightOnRectangleIcon,
    },
  ];

  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        {routes
          .find(r => r.layout === "auth")
          .pages.map((page) => (
            <Route key={page.path} path={page.path} element={page.element} />
          ))}
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
