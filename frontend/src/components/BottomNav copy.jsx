import { useNavigate } from "react-router-dom";

export default function BottomNav({ selected, onSelect }) {
  const navigate = useNavigate();
  
  const navLinks = [
    { label: "Home", icon: "home", path: "/" },
    { label: "Explore", icon: "rectangle-vertical-history", path: "/buddy" },
    { label: "Likes", icon: "heart", path: "/likes" },
    { label: "More", icon: "apps", path: "/" },
    { label: "Profile", icon: "user", path: "/profile" },
  ];

  const handleNavClick = (link) => {
    onSelect(link.label);
    navigate(link.path);
  };

  return (
    <div className="fixed flex items-center justify-center bottom-4 left-0 w-full z-50">
      <div className="flex items-center justify-center gap-2 bg-black text-white rounded-full h-18 p-3 shadow-lg">
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNavClick(link)}
            className={`rounded-full w-14 h-14 text-xl ${
              selected === link.label
                ? "bg-gray-100 text-gray-800"
                : "bg-transparent text-gray-200"
            }`}
          >
            <i className={`fi fi-rr-${link.icon}`}></i>
          </button>
        ))}
      </div>
    </div>
  );
}