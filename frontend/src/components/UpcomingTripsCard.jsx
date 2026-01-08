import React from "react";
import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";

const HorizontalCardStack = () => {
  // Sample groups data


  const groups = [
    {
      id: 1,
      coverUrl: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
      profileUrl: "https://i.pravatar.cc/41",
      bio: "Jaipur",
      name: "Jaipur TravelShip",
      rating: 5.0,
      reviews: 143,
    },
    {
      id: 2,
      coverUrl: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
      profileUrl: "https://i.pravatar.cc/42",
      bio: "Delhi",
      name: "Travel Aires",
      rating: 4.8,
      reviews: 128,
    },
    {
      id: 3,
      coverUrl: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
      profileUrl: "https://i.pravatar.cc/43",
      bio: "Mumbai",
      name: "Enjoy JOY",
      rating: 4.7,
      reviews: 112,
    },
    {
      id: 4,
      coverUrl: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
      profileUrl: "https://i.pravatar.cc/44",
      bio: "Goa",
      name: "Lima",
      rating: 4.9,
      reviews: 156,
    },
    {
      id: 5,
      coverUrl: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
      profileUrl: "https://i.pravatar.cc/45",
      bio: "Chile",
      name: "Santiago",
      rating: 4.6,
      reviews: 98,
    },
  ];

  const containerRef = React.useRef(null);
  const [likedCards, setLikedCards] = React.useState({});

  // Toggle like status for a card
  const toggleLike = (id) => {
    setLikedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Scroll to previous card
  const prevCard = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -316, behavior: "smooth" }); // 300px card + 16px gap
    }
  };

  // Scroll to next card
  const nextCard = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 316, behavior: "smooth" });
    }
  };

  return (
    <div className="relative max-w-screen-lg mx-auto px-2 py-0">
      <div className="relative overflow-hidden">
        {/* Card container */}
        <div
          className="flex gap-4 py-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          ref={containerRef}
          style={{ scrollBehavior: "smooth" }}
        >
          {groups.map((group) => (
            <DestinationCard
              key={group.id}
              group={group}
              isLiked={likedCards[group.id] || false}
              onLike={() => toggleLike(group.id)}
              style={{ width: "300px", flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const DestinationCard = ({ group, isLiked, onLike, style }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg snap-center"
      style={style}
    >
      {/* Card image */}
      <div className="relative h-28">
        <img
          src={group.coverUrl}
          alt={group.name}
          className="w-full h-full object-cover"
          draggable="false"
        />
        {/* Like button */}
        <button
          className={`absolute top-3 right-3 p-2 rounded-full ${
            isLiked ? "bg-red-500" : "bg-white/70 hover:bg-white"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? "text-white fill-white" : "text-gray-800"
            }`}
          />
        </button>
      </div>

      {/* Card content */}
      <div className="p-4 bg-black">
        <div className="flex relative mb-10">
            <div className="absolute -top-16 flex w-24 h-24 bg-white rounded-full overflow-hidden">
                <img className="w-full h-full" src={group.profileUrl} alt="" />
            </div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-100">
              {group.name}
            </h3>
            <p className="text-gray-300 text-sm">{group.bio}</p>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-100">
              {group.rating}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {group.reviews} reviews
          </span>
        </div>
        <div className="flex w-full mt-2">
          <button className="px-3 py-2 w-full text-sm bg-gray-100 hover:bg-gray-200 text-black rounded-full">
           Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default HorizontalCardStack;
