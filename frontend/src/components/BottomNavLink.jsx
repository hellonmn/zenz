import { Home, Heart, MoreHorizontal } from "lucide-react";

export default function BottomNavLink({icon}) {
  const navLink = ["Asia", "Europe", "South America", "North America"];
  return (
    <button className="bg-gray-100 rounded-full w-14 h-14 text-gray-800 text-xl">
      <i className={`fi fi-rr-${icon}`}></i>
    </button>
        
  );
}
