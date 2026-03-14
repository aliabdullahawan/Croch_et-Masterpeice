"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

function isItemActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "");

  const activeFromPath = useMemo(() => {
    const matched = items.find((item) => isItemActive(pathname, item.url));
    return matched?.name ?? items[0]?.name ?? "";
  }, [items, pathname]);

  useEffect(() => {
    setActiveTab(activeFromPath);
  }, [activeFromPath]);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:static sm:bottom-auto sm:left-auto sm:translate-x-0 transition-all duration-500 ease-out",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border border-brand-gold/24 bg-brand-base/70 backdrop-blur-xl py-1 px-1 rounded-full shadow-[0_10px_34px_rgba(0,0,0,0.28)] transition-all duration-500 ease-out">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-xs md:text-sm font-semibold px-3 md:px-5 py-2 rounded-full transition-colors",
                "text-brand-creamDim hover:text-brand-gold",
                isActive && "text-brand-gold"
              )}
              aria-label={item.name}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden inline-flex items-center justify-center">
                <Icon size={17} strokeWidth={2.2} />
              </span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-brand-gold/12 border border-brand-gold/25" />
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-gold rounded-t-full">
                    <div className="absolute w-12 h-5 bg-brand-gold/25 rounded-full blur-md -top-1.5 -left-2" />
                    <div className="absolute w-7 h-4 bg-brand-gold/25 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-3 bg-brand-gold/25 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
