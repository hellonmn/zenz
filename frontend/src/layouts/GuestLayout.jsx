import { Outlet } from "react-router-dom";

export default function GuestLayout() {
  return (
    <div className="min-h-screen min-w-screen overflow-hidden">
      <Outlet />
    </div>
  );
}
