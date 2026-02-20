"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ProfileMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  signOutAction: () => Promise<void>;
}

export function ProfileMenu({ user, signOutAction }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            {user.email && (
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/settings/categories"
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/dashboard/settings/currency"
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Currency
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
