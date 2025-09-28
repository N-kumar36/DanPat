import Stories from "../components/Stories";
import PostsFeed from "../components/PostsFeed";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4 text-gray-300">
              <p className="font-bold text-lg">Shortcuts</p>
              <Link
                href="/profile"
                className="block p-3 hover:bg-gray-800 rounded-lg transition"
              >
                Friends
              </Link>
              <Link
                href="/groups"
                className="block p-3 hover:bg-gray-800 rounded-lg transition"
              >
                Groups
              </Link>
              <Link
                href="/events"
                className="block p-3 hover:bg-gray-800 rounded-lg transition"
              >
                Events
              </Link>
            </div>
          </aside>

          {/* Main Feed Column */}
          <section className="lg:col-span-6 space-y-6">
            {/* Stories */}
            <Stories />

            {/* Posts Feed */}
            <PostsFeed />
          </section>

          {/* Right Sidebar */}
          <aside className="hidden xl:block xl:col-span-3">
            <div className="sticky top-20 space-y-6 text-gray-300">
              <p className="font-bold text-lg border-b border-gray-800 pb-2">
                Friends Online
              </p>

              {/* Example Friend */}
              <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition cursor-pointer">
                <div className="relative">
                  <Image
                    src="https://i.pravatar.cc/32?u=f1"
                    alt="Friend"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-neutral-950"></span>
                </div>
                <span>Friend 1 Name</span>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition cursor-pointer">
                <div className="relative">
                  <Image
                    src="https://i.pravatar.cc/32?u=f2"
                    alt="Friend"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-neutral-950"></span>
                </div>
                <span>Friend 2 Name</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
