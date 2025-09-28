// components/Post.js
import Image from "next/image";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react"; // Using Lucide for a modern icon set

// Icons for the post footer (assuming you installed lucide-react)
const PostFooterIcon = ({ Icon, text }) => (
  <button className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition">
    <Icon className="h-5 w-5" />
    <span className="hidden sm:inline">{text}</span>
  </button>
);

const Post = ({ post }) => {
  return (
    <div className="bg-neutral-900 rounded-lg shadow-xl mb-6 p-4">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={`https://i.pravatar.cc/50?u=${post.user.id}`}
          alt={post.user.name}
          width={40}
          height={40}
          className="rounded-full border border-indigo-500 object-cover"
        />
        <div>
          <p className="font-semibold text-white">{post.user.name}</p>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-300 mb-4">{post.content}</p>

      {/* Post Image (if any) */}
      {post.image && (
        <div className="relative w-full h-80 mb-4 rounded-lg overflow-hidden">
          <Image
            src={post.image}
            alt="Post image"
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}

      {/* Post Actions/Stats */}
      <div className="flex justify-between items-center text-gray-400 border-t border-b border-gray-800 py-2 my-2">
        <p className="text-sm">{post.likes} Likes</p>
        <p className="text-sm">{post.comments} Comments</p>
      </div>

      {/* Post Footer Buttons */}
      <div className="flex justify-around">
        <PostFooterIcon Icon={ThumbsUp} text="Like" />
        <PostFooterIcon Icon={MessageCircle} text="Comment" />
        <PostFooterIcon Icon={Share2} text="Share" />
      </div>
    </div>
  );
};

export default Post;