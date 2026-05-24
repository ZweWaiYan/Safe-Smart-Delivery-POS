import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BuildingOffice2Icon
} from "@heroicons/react/24/solid";
import { Truck, Store, Users, ChartPie, MapPlus, FileUser, CircleUserRound } from 'lucide-react';
import { Home, WayPage, DeliveryListPage, DeliAreaListPage, CustomerListPage, UserListPage } from "@/pages/dashboard";
import OutletListPage from "./pages/dashboard/outletListPage";
import { SignIn } from "@/pages/auth";
import MarketListPage from "./pages/dashboard/marketListPage";
import TownShipListPage from "./pages/dashboard/townShipListPage";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <ChartPie {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Way",
        path: "/waypage",
        element: <WayPage />,
      },
      {
        icon: <Truck {...icon} />,
        name: "Delivery",
        path: "/deliveryListPage",
        element: <DeliveryListPage />,
      },
      {
        icon: <Users {...icon} />,
        name: "Customer",
        path: "/customerListPage",
        element: <CustomerListPage />,
      },
      {
        icon: <FileUser {...icon} />,
        name: "Outlet",
        path: "/outletListPage",
        element: <OutletListPage />,
      },
      {
        icon: <MapPlus  {...icon} />,
        name: "Deli Car",
        path: "/deliAreaListPage",
        element: <DeliAreaListPage />,
      },
      {
        icon: <BuildingOffice2Icon  {...icon} />,
        name: "TownShip",
        path: "/townshipListPage",
        element: <TownShipListPage />,
      },
      {
        icon: <Store {...icon} />,
        name: "Market",
        path: "/marketListPage",
        element: <MarketListPage />,
      },
      {
        icon: <CircleUserRound  {...icon} />,
        name: "User",
        path: "/userListPage",
        element: <UserListPage />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
