import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  // Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav } from "@/context";
import { routesList } from "../data/local-data";

export function Dashboard() {

  const storedRoutes = JSON.parse(localStorage.getItem("routes")) || [];

  
  const transformedRoutes = storedRoutes.map(item => {
    // Find the matching label by value
    const match = routesList.find(r => r.value === item.pageRoute);
    return {
      ...item,
      pageRouteId: item.pageRoute,
      pageRoute: match ? match.label : item.pageRoute // replace number with text
    };
  });  

  const dashboardRoutes = routes.find((r) => r.layout === "dashboard")?.pages || [];
  const visibleRoutes = dashboardRoutes.filter(route => {
    const permission = transformedRoutes.find(
      item => item.pageRoute === route.name
    );

    return permission?.canView;
  });


  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;

  return (
    <div className="flex h-screen bg-blue-gray-50/50 overflow-hidden">
      {/* Mobile backdrop */}
      {openSidenav && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        />
      )}

      {/* Sidenav with animation */}
      <aside
        className={`
    fixed md:static top-0 left-0 h-full z-50 
    transition-all duration-300 overflow-hidden
    ${openSidenav ? "max-w-[212px]" : "max-w-0"}
  `}
      >
        <div className="h-full overflow-y-auto">
          <Sidenav
            routes={[
              {
                layout: "dashboard",
                pages: visibleRoutes
              }
            ]}
            brandImg={
              sidenavType === "dark"
                ? "/img/logo-ct.png"
                : "/img/logo-ct-dark.png"
            }
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden  transition-all duration-300">
        <DashboardNavbar />
        <div className="flex-1 overflow-y-auto p-4">
          <Routes>
            {visibleRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* Default redirect to /dashboard/home */}
            <Route path="/" element={<Navigate to="/dashboard/waypage" replace />} />

            {/* Handle unknown dashboard paths */}
            <Route path="*" element={<Navigate to="/dashboard/waypage" replace />} />
          </Routes>
          {/* <div className="text-blue-gray-600 mt-4">
            <Footer />
          </div> */}
        </div>
      </main>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
