"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// =================================================================
// ICONS
// =================================================================
const Icon = ({ path, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

const UserIcon = (props) => (
  <Icon {...props} path={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
);
const GridIcon = (props) => (
  <Icon {...props} path={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /></>} />
);
const HeartIcon = (props) => (
  <Icon {...props} path={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />} />
);

// =================================================================
// MOCK DATA
// =================================================================
const mockUser = {
  name: "Jane Doe",
  handle: "@janedoe_dev",
  avatar: "https://i.pravatar.cc/150?u=janedoe_dev",
  banner: "https://placehold.co/1200x300/0f172a/475569?text=Profile+Banner",
  bio: "✨ Frontend Developer | Building aesthetic UIs | Lover of motion design and React.js",
  stats: { posts: 158, followers: "12.5K", following: 305 },
};

const mockPosts = [
  { id: 1, likes: 231, comments: 42, url: "https://placehold.co/400x400/4f46e5/ffffff?text=React+Grid" },
  { id: 2, likes: 502, comments: 88, url: "https://placehold.co/400x400/10b981/ffffff?text=Tailwind+CSS" },
  { id: 3, likes: 98, comments: 15, url: "https://placehold.co/400x400/f97316/ffffff?text=State+Management" },
  { id: 4, likes: 345, comments: 60, url: "https://placehold.co/400x400/3b82f6/ffffff?text=Dark+Mode+Design" },
  { id: 5, likes: 121, comments: 20, url: "https://placehold.co/400x400/eab308/ffffff?text=Component+Tree" },
  { id: 6, likes: 678, comments: 102, url: "https://placehold.co/400x400/ef4444/ffffff?text=UI%2FUX+Tips" },
];

// =================================================================
// POST CARD
// =================================================================
const PostCard = ({ post }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="relative group aspect-square rounded-2xl overflow-hidden 
               bg-neutral-800 cursor-pointer shadow-lg"
  >
    <img src={post.url} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-70" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition">
      <div className="flex items-center text-white font-semibold text-lg">
        <HeartIcon className="w-5 h-5 mr-2 fill-white" /> {post.likes}
      </div>
      <div className="flex items-center text-white font-semibold text-lg">
        💬 {post.comments}
      </div>
    </div>
  </motion.div>
);

// =================================================================
// PROFILE HEADER
// =================================================================
const ProfileHeader = ({ user }) => (
  <div>
    <div className="h-52 md:h-64 relative">
      <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    </div>

    <div className="relative p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-24">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 p-[3px]" />
            <img
              src={user.avatar}
              alt={user.name}
              className="relative w-32 h-32 rounded-full object-cover border-4 border-neutral-900"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-gray-400">{user.handle}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition text-gray-300">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white rounded-full text-sm font-medium transition shadow-lg shadow-indigo-600/30">
            Share
          </button>
        </div>
      </div>

      <p className="mt-4 text-gray-300 max-w-2xl">{user.bio}</p>

      <div className="flex gap-8 mt-4 text-white">
        <div><span className="font-bold text-lg">{user.stats.posts}</span> <span className="text-gray-400">Posts</span></div>
        <div><span className="font-bold text-lg">{user.stats.followers}</span> <span className="text-gray-400">Followers</span></div>
        <div><span className="font-bold text-lg">{user.stats.following}</span> <span className="text-gray-400">Following</span></div>
      </div>
    </div>
  </div>
);

// =================================================================
// PROFILE PAGE
// =================================================================
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("posts");

  const tabClass = (tab) =>
    `flex items-center gap-2 px-6 py-3 font-medium text-sm transition cursor-pointer ${
      activeTab === tab
        ? "text-indigo-400 border-b-2 border-indigo-500"
        : "text-gray-500 hover:text-white hover:border-b-2 hover:border-gray-700"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-white p-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <ProfileHeader user={mockUser} />

        <div className="border-t border-white/10 flex justify-center">
          <div className="flex">
            <div className={tabClass("posts")} onClick={() => setActiveTab("posts")}>
              <GridIcon className="w-5 h-5" /> Posts
            </div>
            <div className={tabClass("likes")} onClick={() => setActiveTab("likes")}>
              <HeartIcon className="w-5 h-5" /> Likes
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "posts" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {mockPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <HeartIcon className="w-10 h-10 mx-auto mb-3" />
              <p>No liked posts yet 💫</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
