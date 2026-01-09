import React, { useState, useRef, useEffect } from "react";
import { Heart, ChevronRight, Star } from "lucide-react";

// CardStack component to manage multiple cards
const CardStack = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      url: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
      country: "Brazil",
      city: "Rio de Janeiro",
      rating: 5.0,
      reviews: 143,
    },
    {
      id: 2,
      url: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
      country: "Argentina",
      city: "Buenos Aires",
      rating: 4.8,
      reviews: 128,
    },
    {
      id: 3,
      url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/d3/a8/57/images-30-largejpg.jpg?w=500&h=-1&s=1",
      country: "Colombia",
      city: "Cartagena",
      rating: 4.7,
      reviews: 112,
    },
    {
      id: 4,
      url: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
      country: "Peru",
      city: "Lima",
      rating: 4.9,
      reviews: 156,
    },
    {
      id: 5,
      url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/d3/a8/57/images-30-largejpg.jpg?w=500&h=-1&s=1",
      country: "Chile",
      city: "Santiago",
      rating: 4.6,
      reviews: 98,
    }
  ]);

  const [exitingCard, setExitingCard] = useState(null);
  const [exitDirection, setExitDirection] = useState(null);
  const [showLikeEffect, setShowLikeEffect] = useState(false);

  // Remove a card from the stack
  const removeCard = (id) => {
    setTimeout(() => {
      setCards(cards.filter((card) => card.id !== id));
      setExitingCard(null);
      setExitDirection(null);
      setShowLikeEffect(false);
    }, 300); // Delay to allow animation to complete
  };

  // Handle card exit with animation
  const handleCardExit = (id, direction) => {
    setExitingCard(id);
    setExitDirection(direction);

    if (direction === "right") {
      setShowLikeEffect(true);
      setTimeout(() => {
        removeCard(id);
      }, 800); // Longer delay for like effect to show
    } else {
      removeCard(id);
    }
  };

  // Calculate position styles for each card based on its index in the stack
  const getCardStyle = (index) => {
    // Main card (top of stack)
    if (index === 0) {
      return {
        zIndex: cards.length + 1,
        transform: "scale(1) translateY(0) rotate(0deg)",
        opacity: 1
      };
    }
    // Left preview card
    else if (index === 1) {
      return {
        zIndex: cards.length,
        transform: "scale(0.92) translateX(-10px) translateY(10px) rotate(-8deg)",
        opacity: 0.8
      };
    }
    // Right preview card
    else if (index === 2) {
      return {
        zIndex: cards.length - 1,
        transform: "scale(0.92) translateX(10px) translateY(10px) rotate(8deg)",
        opacity: 0.8
      };
    }
    // Hidden cards
    else {
      return {
        zIndex: cards.length - index,
        transform: `scale(${0.9 - (index - 2) * 0.05}) translateY(${index * 5}px)`,
        opacity: index > 3 ? 0 : 0.5
      };
    }
  };

  return (
    <div className="font-sans max-w-sm mx-auto mt-4">
      {/* Swipe instructions */}
      {/* <div className="text-center mb-3 text-gray-500 text-xs">
        Swipe left to skip, swipe right to like
      </div> */}

      {/* Card stack container */}
      <div className="relative h-96 w-72 mx-auto">
        {/* Like effect overlay */}
        {showLikeEffect && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-4 animate-pulse">
              <Heart className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Render cards in stack */}
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="absolute inset-0 transition-all duration-300"
            style={getCardStyle(index)}
          >
            <DestinationCard
              {...card}
              isExiting={card.id === exitingCard}
              exitDirection={exitDirection}
              onSwipe={(direction) => handleCardExit(card.id, direction)}
              isActive={index === 0} // Only the top card is interactive
            />
          </div>
        ))}

        {/* Empty state when no cards left */}
        {cards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl">
            <div className="text-center p-6">
              <p className="text-lg font-medium text-gray-800 mb-2">
                No more destinations
              </p>
              <button
                className="px-5 py-3 bg-gray-900 text-white rounded-full"
                onClick={() => {
                  // Reset cards
                  setCards([
                    {
                      id: 1,
                      url: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
                      country: "Brazil",
                      city: "Rio de Janeiro",
                      rating: 5.0,
                      reviews: 143,
                    },
                    {
                      id: 2,
                      url: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
                      country: "Argentina",
                      city: "Buenos Aires",
                      rating: 4.8,
                      reviews: 128,
                    },
                    {
                      id: 3,
                      url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/d3/a8/57/images-30-largejpg.jpg?w=500&h=-1&s=1",
                      country: "Colombia",
                      city: "Cartagena",
                      rating: 4.7,
                      reviews: 112,
                    },
                    {
                      id: 4,
                      url: "https://www.rajasthantourplanner.com/blog/wp-content/uploads/2017/11/Amber-fort-Jaipur-1.jpg",
                      country: "Peru",
                      city: "Lima",
                      rating: 4.9,
                      reviews: 156,
                    },
                    {
                      id: 5,
                      url: "https://www.gokite.travel/wp-content/uploads/2025/02/3.-Jaipur-%E2%80%93-The-Pink-City.webp",
                      country: "Chile",
                      city: "Santiago",
                      rating: 4.6,
                      reviews: 98,
                    }
                  ]);
                }}
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getSavedTrips = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.savedTrips || [];
  } catch {
    return [];
  }
};

// Individual card component with swipe functionality
const DestinationCard = ({
  id,
  url,
  country,
  city,
  rating,
  reviews,
  onSwipe,
  isExiting = false,
  exitDirection = null,
  isActive = false,
}) => {
  // State for swipe functionality
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Check if already saved
  useEffect(() => {
    const saved = getSavedTrips().some(t => t.id === id);
    setIsLiked(saved);
  }, [id]);

  // Reference to the card element
  const cardRef = useRef(null);

  // Calculate transform values for visual effects
  const calculateTransform = () => {
    // If card is exiting, apply exit animation
    if (isExiting) {
      const exitX = exitDirection === "left" ? -500 : 500;
      const exitRotate = exitDirection === "left" ? -30 : 30;
      return { x: exitX, rotate: exitRotate, opacity: 0 };
    }

    // Normal dragging transform
    if (!isDragging) return { x: 0, rotate: 0, opacity: 1 };

    const deltaX = currentX - startX;
    // Apply a multiplier to increase swipe sensitivity
    const sensitivityFactor = 1.5;
    const adjustedDeltaX = deltaX * sensitivityFactor;

    const rotate = adjustedDeltaX * 0.15; // Increased rotation factor
    const opacity = Math.max(0.6, 1 - Math.abs(adjustedDeltaX) / 200);

    return { x: adjustedDeltaX, rotate, opacity };
  };

  const transform = calculateTransform();

  // Mouse event handlers - only active if this is the top card
  const handleMouseDown = (e) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);

    // Prevent text selection during drag
    if (cardRef.current) {
      cardRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isActive) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging || !isActive) return;
    const deltaX = currentX - startX;

    // Lower threshold for swipe detection (more sensitive)
    const swipeThreshold = 50;

    // Handle swipe actions if threshold met
    if (deltaX > swipeThreshold) {
      // Swipe right - like
      setIsLiked(true);
      onSwipe && onSwipe("right");
    } else if (deltaX < -swipeThreshold) {
      // Swipe left - dislike
      onSwipe && onSwipe("left");
    } else {
      // Reset state if threshold not met
      setIsDragging(false);
      setCurrentX(0);
      setStartX(0);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isActive) return;
    setCurrentX(e.touches[0].clientX);

    // Prevent page scrolling with reduced threshold
    if (Math.abs(currentX - startX) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchEnd = () => {
    if (isActive) {
      handleMouseUp(); // Reuse the same logic
    }
  };

  // Toggle like status directly
  const toggleLike = async (e) => {
    if (!isActive) return;
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    const trip = {
      id,
      name: city,
      image: url,
      location: country,
      date: new Date().toISOString(),
    };
    if (isLiked) {
      // Unsave from backend
      try {
        await fetch("https://zenz-backend.onrender.com/api/auth/unsave-trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id })
        });
        // Update localStorage user.savedTrips
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.savedTrips = (user.savedTrips || []).filter(t => t.id !== id);
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch {}
      setIsLiked(false);
      return;
    }
    // Save to backend
    setIsLiked(true);
    try {
      await fetch("https://zenz-backend.onrender.com/api/auth/save-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trip)
      });
      // Optionally update localStorage user.savedTrips
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        user.savedTrips = [...(user.savedTrips || []), trip];
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}
    if (!isLiked) {
      onSwipe && onSwipe("right");
    }
  };

  // Global event cleanup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging && isActive) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, currentX, startX, isActive]);

  return (
    <div
      ref={cardRef}
      className={`relative w-72 h-80 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${
        isActive ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        transform: isActive 
          ? `translateX(${transform.x}px) rotate(${transform.rotate}deg)` 
          : undefined,
        opacity: isActive ? transform.opacity : undefined,
      }}
      onMouseDown={!isExiting && isActive ? handleMouseDown : undefined}
      onMouseMove={!isExiting && isActive ? handleMouseMove : undefined}
      onMouseUp={!isExiting && isActive ? handleMouseUp : undefined}
      onMouseLeave={!isExiting && isActive ? handleMouseUp : undefined}
      onTouchStart={!isExiting && isActive ? handleTouchStart : undefined}
      onTouchMove={!isExiting && isActive ? handleTouchMove : undefined}
      onTouchEnd={!isExiting && isActive ? handleTouchEnd : undefined}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={url}
          alt={city}
          className="w-full h-full object-cover"
          draggable="false" // Prevent image dragging
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>

      {/* Like button - only visible on active card */}
      {isActive && (
        <div
          className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-full z-10"
          onClick={!isExiting ? toggleLike : undefined}
        >
          <Heart
            className={`w-5 h-5 ${
              isLiked ? "text-red-500 fill-red-500" : "text-white"
            }`}
          />
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <p className="text-sm font-medium mb-1">{country}</p>
        <h2 className="text-2xl font-bold mb-2">{city}</h2>

        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium">{rating}</span>
          <span className="text-gray-300 text-sm ml-2">{reviews} reviews</span>
        </div>
      </div>

      {/* See more button - only visible on active card */}
      {isActive && (
        <div className="absolute bottom-6 right-4">
          <button
            className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-1 text-sm font-medium"
            onClick={(e) => e.stopPropagation()} // Prevent triggering card events
          >
            See more
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Swipe indicators - only visible on active card */}
      {isActive && isDragging && transform.x > 20 && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-green-500 rounded-full p-2 transition-opacity duration-200">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
      )}
      {isActive && isDragging && transform.x < -20 && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-red-500 rounded-full p-2 transition-opacity duration-200">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CardStack;