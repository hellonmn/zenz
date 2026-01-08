const tabs = ["Asia", "Europe", "South America", "North America"];

export default function Tabs({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`px-4 py-1 rounded-full border border-gray-200 text-nowrap ${
            selected === tab
              ? "bg-green-900 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
