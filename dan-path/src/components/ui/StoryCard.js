// components/StoryCard.js
import Image from "next/image";

const StoryCard = ({ user, imageUrl, isCreate = false }) => {
  if (isCreate) {
    return (
      <div className="relative h-48 w-28 rounded-xl cursor-pointer shadow-lg transform transition duration-200 hover:scale-105 overflow-hidden flex-shrink-0">
        <Image
          src="https://i.pravatar.cc/100"
          alt="Your Story"
          layout="fill"
          objectFit="cover"
          className="brightness-90 hover:brightness-100 transition duration-200"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <span className="text-white font-bold text-sm text-center">+ Create Story</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-28 rounded-xl cursor-pointer shadow-lg transform transition duration-200 hover:scale-105 overflow-hidden flex-shrink-0">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={`${user}'s story`}
        layout="fill"
        objectFit="cover"
        className="brightness-90 hover:brightness-100 transition duration-200"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {/* User Profile Avatar */}
      <div className="absolute top-2 left-2 z-10">
        <Image
          src={`https://i.pravatar.cc/32?u=${user}`}
          alt={`${user} avatar`}
          width={36}
          height={36}
          className="rounded-full border-4 border-indigo-500 object-cover"
        />
      </div>

      {/* User Name */}
      <p className="absolute bottom-2 left-2 text-white font-semibold text-sm z-10 truncate w-10/12">
        {user}
      </p>
    </div>
  );
};

export default StoryCard;
