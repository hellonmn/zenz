import Header from "../../components/Header";
import Tabs from "../../components/Tabs";
import DestinationCard from "../../components/DestinationCard";
import BottomNav from "../../components/BottomNav";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import UpcomingTripsCard from "../../components/UpcomingTripsCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Add this import

export default function Swipe() {
  const [selectedTab, setSelectedTab] = useState("Asia");
  const [selectedNav, setSelectedNav] = useState("Home");

  const navigate = useNavigate();

  return (
    <motion.div
      className="pb-28 bg-gray-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      <div className="relative px-4">
        <input
          className="w-full border-2 border-gray-200 text-xl pl-12 pr-12 h-14 rounded-full bg-white outline-none text-gray-800"
          placeholder="Search"
        />
        <span className="absolute top-4.5 left-9 text-gray-600 text-xl">
          <i className="fi fi-rr-search"></i>
        </span>
        <button
          id="detailsPage"
          className="absolute top-1 right-5 flex items-center justify-center text-gray-100 rounded-full bg-gray-800 w-12 h-12"
          onClick={() => navigate("/details")}
        >
          <i className="fi fi-rr-bars-staggered"></i>
        </button>
      </div>

      <div className="visitingTab px-4">
        <h2 className="mt-4 mb-4 font-semibold text-gray-800 text-xl">
          Select your next trip
        </h2>
        <Tabs selected={selectedTab} onSelect={setSelectedTab} />
      </div>

      <div className="flex items-center justify-center gap-3 overflow-x-auto px-4">
        <div onClick={() => navigate("/details")}>
          <DestinationCard
            url={
              "https://media.istockphoto.com/id/478627080/photo/evening-view-of-ama-dablam.jpg?s=612x612&w=0&k=20&c=GLKvtQt1JVoOB4yR2WI86_fYOmG8WObeZP_QV_gFG_0="
            }
          />
        </div>
        {/* <DestinationCard url={"https://media.istockphoto.com/id/1453838542/photo/last-light-on-mount-sneffels.jpg?s=612x612&w=0&k=20&c=IBOZYpAjhV5hFEL8yKYmY2ZCyCaGEOrXR5VZI13NMRI="}/> */}
      </div>

      <div className="gap-3 px-4 pb-4 -mt-10">
        <h2 className="mt-4 mb-4 font-semibold text-gray-800 text-xl">
          Popular Groups
        </h2>
        {/* <div className="flex gap-3 overflow-x-auto px-4"> */}
        <UpcomingTripsCard
          url={
            "https://media.istockphoto.com/id/478627080/photo/evening-view-of-ama-dablam.jpg?s=612x612&w=0&k=20&c=GLKvtQt1JVoOB4yR2WI86_fYOmG8WObeZP_QV_gFG_0="
          }
        />
        {/* </div> */}
      </div>

      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />
    </motion.div>
  );
}