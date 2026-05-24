import React, { useEffect, useState } from "react";
import {
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
} from "@/data";
import { ClockIcon, Bars3Icon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { wayCountsAll } from "@/api/wayAPI";


import { useNavigate } from "react-router-dom";

export function Home() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  const [counts, setCounts] = useState({});
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await wayCountsAll();      
      setCounts(res);
      setTimestamp(res.timestamp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div>
      {/* Navbar toggle and refresh */}
      <div className="mb-3 flex items-center">
        <IconButton
          variant="text"
          color="blue-gray"
          className="ml-5"
          onClick={() => setOpenSidenav(dispatch, !openSidenav)}
        >
          <Bars3Icon strokeWidth={3} className="h-7 w-7 text-black" />
        </IconButton>

        <IconButton
          variant="text"
          color="blue-gray"
          className="ml-5"
          onClick={fetchCounts} // ✅ refresh counts
        >
          <ArrowPathIcon strokeWidth={3} className="h-7 w-7 text-black" />
        </IconButton>
      </div>

      {/* Statistics Cards */}
      <div className="mb-5 mt-0 grid gap-y-10 gap-x-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {statisticsCardsData.map(({ icon, title, ...rest }) => {
          const count = counts[title] ?? 0;          
          return (
            <div
              key={title}
              className="cursor-pointer"
              onClick={() =>
                navigate("/dashboard/waypage", { state: { fromDashboard: true, statusName: title , statusValue : counts[title] } })
              }

            >
              <StatisticsCard
                {...rest}
                title={title}
                value={loading ? "..." : count}
                icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
                footer={
                  <Typography className="font-normal text-sm text-blue-gray-600">
                    {loading
                      ? "Loading..."
                      : timestamp
                        ? `Latest: ${new Date(timestamp).toLocaleString("en-GB", { hour12: false })}`
                        : "No data"}
                  </Typography>
                }
              />
            </div>
          );
        })}
      </div>

      {/* Statistics Charts */}
      <div className="mb-0 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
