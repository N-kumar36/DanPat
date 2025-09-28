// components/PostsFeed.js
import Post from "./Post";

const dummyPosts = [
  {
    id: 1,
    user: { id: "u1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/40?u=u1" },
    content: "Just finished my new React project! Check it out and let me know what you think.",
    image: null,
    timestamp: "2 hours ago",
    likes: 42,
    comments: 10,
  },
  {
    id: 2,
    user: { id: "u2", name: "Bob Williams", avatar: "https://i.pravatar.cc/40?u=u2" },
    content: "Amazing sunset tonight. Had to share this view! 🌅",
    image: "https://picsum.photos/id/1080/600/400",
    timestamp: "5 hours ago",
    likes: 120,
    comments: 35,
  },
  {
    id: 3,
    user: { id: "u3", name: "Charli Davis", avatar: "https://i.pravatar.cc/40?u=u3" },
    content: "Anyone else struggling with Tailwind CSS utility classes sometimes? 🤔",
    image: null,
    timestamp: "1 day ago",
    likes: 15,
    comments: 8,
  },
];

const PostsFeed = () => {
  return (
    <div className="mt-6 space-y-6">
      {dummyPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsFeed;
