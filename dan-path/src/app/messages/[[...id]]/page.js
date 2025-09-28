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
];

// =================================================================
// 2. CHAT VIEW COMPONENT (Detail Panel)
// =================================================================
function ChatView({ userId }) {
  // Find user details for the header
  const user = dummyMessages.find(msg => msg.id == userId);

  const [messages, setMessages] = useState([
    { from: "me", text: "Hello!" },
    { from: "user", text: "Hi, how are you?" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { from: "me", text: newMessage }]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Use useEffect to reset state if the user changes
  useEffect(() => {
    // Reset dummy messages when switching chat
    setMessages([
        { from: "user", text: `I am user ${userId}. What's up?` },
        { from: "me", text: "Just testing this new UI!" },
    ]);
  }, [userId]);


  return (
    <div className="flex flex-col flex-1 border-l border-gray-800 h-full">
      {/* Header */}
      <header className="p-4 bg-neutral-900 border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Back button for mobile view */}
          <Link href="/messages" className="md:hidden text-indigo-400 hover:text-indigo-300">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
             </svg>
          </Link>
          <h1 className="text-xl font-bold">{user ? user.user : `Chat with User ${userId}`}</h1>
        </div>
      </header>

      {/* Messages Area */}
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
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 flex gap-2 bg-neutral-900 sticky bottom-0 z-10">
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
  );
}

// =================================================================
// 3. MAIN LAYOUT COMPONENT
// =================================================================
export default function MessagesLayout() {
  const params = useParams();
  // The 'id' will be in params.id as an array (e.g., ['1']). 
  // We check if it exists and take the first element, converting it to a number.
  const selectedId = params?.id?.[0] ? parseInt(params.id[0]) : null;

  return (
    // Outer container for centering and defining max width
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center p-4">
      <div 
        className="flex w-full max-w-7xl border border-neutral-800 rounded-xl shadow-2xl overflow-hidden" 
        // Define a fixed height for the chat area on desktop
        style={{ height: 'calc(100vh - 2rem)' }}
      >

        {/* ========================================================== */}
        {/* MESSAGES LIST (Left Sidebar) */}
        {/* ========================================================== */}
        <div
          className={`h-full overflow-y-auto ${
            // On desktop, take 1/3 width. On mobile, take full width if no chat is selected.
            selectedId ? "md:w-1/3" : "w-full"
          } 
          ${selectedId ? "hidden md:block" : "w-full"}`} // Hide list on mobile if a chat is selected
        >
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>
            <div className="flex flex-col space-y-2">
              {dummyMessages.map((msg) => (
                <Link 
                  key={msg.id} 
                  // Route to /messages/[id]
                  href={`/messages/${msg.id}`} 
                  passHref
                >
                  <div
                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-800 cursor-pointer transition ${
                      selectedId == msg.id ? "bg-indigo-900/50 border border-indigo-500" : "bg-neutral-900"
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={msg.avatar}
                        alt={msg.user}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-indigo-500 object-cover"
                      />
                    </div>
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

        {/* ========================================================== */}
        {/* CHAT VIEW (Right Panel) */}
        {/* ========================================================== */}
        {selectedId ? (
          // Show the ChatView if an ID is selected
          <div className={`h-full ${selectedId ? "w-full md:w-2/3" : "hidden"}`}>
            <ChatView userId={selectedId} />
          </div>
        ) : (
          // Show a placeholder on desktop when no chat is selected
          <div className="hidden md:flex w-2/3 items-center justify-center text-gray-500 text-xl bg-neutral-900">
            Select a message to start chatting
          </div>
        )}
      </div>
    </div>
  );
}