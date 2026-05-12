import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [query, setQuery] = useState("");

  const getFeed = async () => {
    if (feed) return;
    try {
      const response = await axios.get(BASE_URL + "/user/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(response.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  /* ── Filter logic ── */
  const filteredFeed = useMemo(() => {
    if (!feed) return [];
    const q = query.trim().toLowerCase();
    if (!q) return feed;
    return feed.filter((user) => {
      const fullName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      const first = (user.firstName ?? "").toLowerCase();
      const last = (user.lastName ?? "").toLowerCase();
      return fullName.includes(q) || first.includes(q) || last.includes(q);
    });
  }, [feed, query]);

  /* ── Loading ── */
  if (!feed) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#c9a84c30] border-t-[#c9a84c] animate-spin" />
          <p className="text-[#d4c28a] text-sm tracking-[0.25em] uppercase">
            Loading Feed
          </p>
        </div>
      </div>
    );
  }

  /* ── Empty feed (no users at all) ── */
  if (feed.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-7xl mb-6">✨</div>
          <h1 className="text-4xl font-bold text-white mb-4">No More Users</h1>
          <p className="text-gray-400 leading-7 text-lg">
            You've explored everyone for now. Come back later to discover new
            people.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-[-150px] w-[400px] h-[400px] bg-[#c9a84c20] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-150px] w-[400px] h-[400px] bg-[#e8c97a10] blur-[140px] rounded-full pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Discover People
              </h1>
              <p className="text-gray-400 mt-2 text-base md:text-lg">
                Connect with developers, creators and innovators.
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-[340px]">
              <div className="relative group">
                {/* Search icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#c9a84c] transition-colors duration-200 pointer-events-none"
                  style={{ width: 18, height: 18 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name…"
                  className="
                    w-full bg-white/[0.04] border border-white/10 rounded-2xl
                    pl-11 pr-10 py-3.5 text-white placeholder:text-gray-500
                    outline-none focus:border-[#c9a84c] focus:bg-white/[0.06]
                    focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)]
                    transition-all duration-300 text-sm
                  "
                />

                {/* Clear × button */}
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      w-6 h-6 flex items-center justify-center
                      rounded-full bg-white/10 hover:bg-white/20
                      text-gray-400 hover:text-white
                      transition-all duration-150 text-xs font-bold
                    "
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Result count hint */}
              {query && (
                <p className="mt-2 text-xs text-gray-500 pl-1 transition-all">
                  {filteredFeed.length === 0
                    ? "No matches found"
                    : `${filteredFeed.length} user${filteredFeed.length !== 1 ? "s" : ""} found for `}
                  {filteredFeed.length > 0 && (
                    <span className="text-[#c9a84c] font-semibold">
                      "{query}"
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Feed grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
        {/* No search results */}
        {filteredFeed.length === 0 && query ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            {/* Illustration */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.18)",
              }}
            >
              🔍
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No users found
              </h2>
              <p className="text-gray-500 text-sm max-w-xs">
                No one matches{" "}
                <span className="text-[#c9a84c] font-semibold">"{query}"</span>.
                Try a different name or clear the search.
              </p>
            </div>
            <button
              onClick={() => setQuery("")}
              className="
                mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold
                border border-[#c9a84c40] text-[#c9a84c]
                hover:bg-[#c9a84c15] transition-all duration-200
              "
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-[repeat(auto-fit,minmax(340px,1fr))]
              gap-10
              justify-items-center
              items-start
            "
          >
            {filteredFeed.map((user) => (
              <div
                key={user._id}
                className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                {/* Highlight matched name letters */}
                <UserCard
                  user={user}
                  isEditable={false}
                  searchQuery={
                    query
                  } /* pass down so UserCard can optionally highlight */
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
