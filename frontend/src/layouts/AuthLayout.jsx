import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
