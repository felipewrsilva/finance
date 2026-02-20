"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

interface ProfileMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  signOutAction: () => Promise<void>;
  locale: string;
}

export function ProfileMenu({ user, signOutAction, locale }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("profile");
  const currentLocale = useLocale();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function switchLocale(newLocale: string) {
    // Replace locale segment in path: /pt-BR/... → /en-US/...
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setOpen(false);
    setLangOpen(false);
  }

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
            {/* Language submenu */}
            <div className="relative">
              <button
                type="button"
                role="menuitem"
                onClick={() => setLangOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span>{t("language")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              {langOpen && (
                <div className="border-t border-gray-50">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      role="menuitem"
                      onClick={() => switchLocale(loc)}
                      className={`flex w-full items-center gap-2 px-6 py-2 text-sm transition-colors hover:bg-gray-50 ${
                        currentLocale === loc ? "text-indigo-600 font-medium" : "text-gray-600"
                      }`}
                    >
                      {currentLocale === loc && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      {currentLocale !== loc && <span className="w-3.5" />}
                      {loc === "pt-BR" ? t("portuguese") : t("english")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/dashboard/settings/categories`}
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {t("categories")}
            </Link>
            <Link
              href={`/${locale}/dashboard/settings/currency`}
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {t("currency")}
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-50"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
