// components/Stories.js
import StoryCard from "./StoryCard";
import Image from "next/image";

const dummyStories = [
  { user: "Jane Doe", imageUrl: "https://picsum.photos/id/1025/200/300" },
  { user: "John Smith", imageUrl: "https://picsum.photos/id/1031/200/300" },
  { user: "Alex Grey", imageUrl: "https://picsum.photos/id/1040/200/300" },
  { user: "Sarah K", imageUrl: "https://picsum.photos/id/1050/200/300" },
  { user: "Mike L", imageUrl: "https://picsum.photos/id/1060/200/300" },
];

const Stories = () => {
  return (
    <div className="w-full bg-neutral-900 py-4 shadow-xl rounded-lg">
      <div className="flex space-x-4 px-4 overflow-x-auto scrollbar-hide">
        
        {/* Create Story Card */}
        <StoryCard isCreate={true} />

        {/* Existing Stories */}
        {dummyStories.map((story) => (
          <StoryCard
            key={story.user}
            user={story.user}
            imageUrl={story.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default Stories;
