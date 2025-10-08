"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// =================================================================
// 1. DUMMY DATA
// =================================================================
const dummyMessages = [
  {
    id: 1,
    user: "Alice Johnson",
    avatar: "https://i.pravatar.cc/40?u=a1",
    lastMessage: "Hey! Are you coming to the event tomorrow?",
    time: "2h ago",
  },
  {
    id: 2,
    user: "Bob Williams",
    avatar: "https://i.pravatar.cc/40?u=b2",
    lastMessage: "Check out this new post I uploaded.",
    time: "5h ago",
  },
  {
    id: 3,
    user: "Charli Davis",
    avatar: "https://i.pravatar.cc/40?u=c3",
    lastMessage: "Can we reschedule our meeting?",
    time: "1d ago",
  },
  {
    id: 4,
    user: "David Smith",
    avatar: "https://i.pravatar.cc/40?u=d4",
    lastMessage: "Loved your recent story!",
    time: "2d ago",
  },
  {
    id: 5,
    user: "Erica Foster",
    avatar: "https://i.pravatar.cc/40?u=e5",
    lastMessage: "Great job on the presentation!",
    time: "2d ago",
  },
  {
    id: 6,
    user: "Frank Green",
    avatar: "https://i.pravatar.cc/40?u=f6",
    lastMessage: "Don't forget the deadline.",
    time: "2d ago",
  },
  {
    id: 7,
    user: "Grace Hill",
    avatar: "https://i.pravatar.cc/40?u=g7",
    lastMessage: "See you next week!",
    time: "3d ago",
  },
  {
    id: 8,
    user: "Henry Jones",
    avatar: "https://i.pravatar.cc/40?u=h8",
    lastMessage: "Thanks for the help.",
    time: "3d ago",
  },
  {
    id: 9,
    user: "Ivy King",
    avatar: "https://i.pravatar.cc/40?u=i9",
    lastMessage: "I'll send the files shortly.",
    time: "3d ago",
  },
  {
    id: 10,
    user: "Jack Lee",
    avatar: "https://i.pravatar.cc/40?u=j10",
    lastMessage: "Can you review this?",
    time: "4d ago",
  },
  {
    id: 11,
    user: "Karen Miller",
    avatar: "https://i.pravatar.cc/40?u=k11",
    lastMessage: "Got it, thanks!",
    time: "4d ago",
  },
  {
    id: 12,
    user: "Leo Nelson",
    avatar: "https://i.pravatar.cc/40?u=l12",
    lastMessage: "Working on it now.",
    time: "4d ago",
  },
];

// =================================================================
// 2. CHAT VIEW COMPONENT (Detail Panel)
// =================================================================
function ChatView({ userId }) {
  const user = dummyMessages.find((msg) => msg.id == userId);

  const [messages, setMessages] = useState([
    { from: "me", text: "Hello!" },
    { from: "user", text: "Hi, how are you?" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim() && !selectedMedia) return;

    const newMsg = { from: "me" };
    if (selectedMedia) {
      newMsg.media = selectedMedia;
      newMsg.type = selectedMedia.type.startsWith("video") ? "video" : "image";
    } else {
      newMsg.text = newMessage;
    }

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setSelectedMedia(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setSelectedMedia({ url: previewURL, type: file.type });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        from: "user",
        text: `${user ? user.user : "User"} says: What's up?`,
      },
      { from: "me", text: "Just testing this new UI!" },
    ]);
  }, [userId, user]);

  return (
    <div className="flex flex-col flex-1 border-l border-gray-800 h-full">
      {/* Header */}
      <header className="p-4 bg-neutral-900 border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="md:hidden text-indigo-400 hover:text-indigo-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          {user && (
            <Image
              src={user.avatar}
              alt={user.user}
              width={50}
              height={50}
              className="rounded-full border-2 border-indigo-500 object-cover"
            />
          )}
          <h1 className="text-xl font-bold">
            {user ? user.user : `Chat with User ${userId}`}
          </h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-4 py-2 rounded-2xl break-words ${
              msg.from === "me"
                ? "bg-indigo-600 text-white ml-auto text-right"
                : "bg-gray-800 text-gray-200 mr-auto text-left"
            }`}
          >
            {msg.text && <p>{msg.text}</p>}
            {msg.media && msg.type === "image" && (
              <img
                src={msg.media.url}
                alt="sent image"
                className="rounded-lg mt-2 max-h-64 object-cover"
              />
            )}
            {msg.media && msg.type === "video" && (
              <video
                src={msg.media.url}
                controls
                className="rounded-lg mt-2 max-h-64 object-cover"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 flex flex-col gap-2 bg-neutral-900 sticky bottom-0 z-10">
        {selectedMedia && (
          <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg">
            {selectedMedia.type.startsWith("image") ? (
              <img
                src={selectedMedia.url}
                alt="preview"
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <video
                src={selectedMedia.url}
                className="h-16 w-16 rounded object-cover"
                controls
              />
            )}
            <button
              onClick={() => setSelectedMedia(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex items-center justify-center bg-neutral-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-full cursor-pointer hover:bg-neutral-700 transition">
            📎
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded-full bg-neutral-800 border border-gray-700 outline-none placeholder-gray-400 text-white"
            placeholder="Type a message..."
          />

          <button
            onClick={handleSend}
            className="px-4 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 3. MAIN LAYOUT COMPONENT
// =================================================================
export default function MessagesLayout() {
  const params = useParams();
  const selectedId = params?.id?.[0] ? parseInt(params.id[0]) : null;

  return (
    <div className="min-h-[91vh] bg-neutral-950 text-white flex justify-center p-4">
      <div
        className="flex w-full max-w-7xl border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        {/* Sidebar */}
        <div
          className={`h-full overflow-y-auto scrollbar-hide w-full md:w-1/3 min-w-0 flex-shrink-0 ${
            selectedId ? "hidden md:block" : "block"
          }`}
        >
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>
            <div className="flex flex-col space-y-2">
              {dummyMessages.map((msg) => (
                <Link key={msg.id} href={`/messages/${msg.id}`} passHref>
                  <div
                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-800 cursor-pointer transition ${
                      selectedId == msg.id
                        ? "bg-indigo-900/50 border border-indigo-500"
                        : "bg-neutral-900"
                    }`}
                  >
                    <Image
                      src={msg.avatar}
                      alt={msg.user}
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-indigo-500 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{msg.user}</p>
                      <p className="text-gray-400 text-sm truncate">
                        {msg.lastMessage}
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs flex-shrink-0">
                      {msg.time}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Chat View */}
        {selectedId ? (
          <div
            className={`h-full ${selectedId ? "w-full md:w-2/3" : "hidden"}`}
          >
            <ChatView userId={selectedId} />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 text-xl bg-neutral-900">
            Select a message to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
