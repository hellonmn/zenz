import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState({ name: "Traveler", profileImage: "https://i.pravatar.cc/40" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored) {
        setUser({
          name: stored.name || "Traveler",
          profileImage: stored.profileImage || "https://i.pravatar.cc/40"
        });
      }
    } catch {}
  }, []);

  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-[#f7f8fa]">
      <div className="flex items-center gap-4">
        <div className="text-left">
          <div className="text-xs text-gray-500">Location</div>
          <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
            Jaipur <span className="text-gray-900 text-base">▼</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <i className="fi fi-rr-bell text-gray-500 text-xl"></i>
          {/* Optionally add a notification dot */}
        </button>
        <Link to="/profile">
          <img
            src={user.profileImage}
            alt="Profile"
            className="size-10 rounded-full object-cover border-2 border-green-900 shadow-md hover:shadow-lg transition"
          />
        </Link>
      </div>
    </div>
  );
}
  