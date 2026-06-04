"use client";

import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  dashboardMainInsetX,
  dashboardMastheadHeight,
} from "@/lib/dashboard-surface";
import {
  Search,
  Bell,
  Mail,
  ChevronDown,
  User,
  Settings,
  LogOut,
  AlertTriangle,
  Info,
} from "lucide-react";

const headerIconButtonClass =
  "h-9 w-9 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-none hover:bg-slate-50 hover:text-slate-800";

export function Header() {
  return (
    <header
      className={cn(
        "flex items-center gap-4 bg-white sm:gap-5",
        dashboardMastheadHeight,
        dashboardMainInsetX
      )}
    >
      <div
        className={cn(
          "relative flex h-9 w-full max-w-[23rem] shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-white pl-3 pr-2 shadow-none ring-0 sm:max-w-[26rem]",
          "transition-[box-shadow,border-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
          "has-[input:focus-visible]:border-blue-300 has-[input:focus-visible]:shadow-[0_0_0_3px_rgb(59_130_246/0.12)] has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-blue-500/25"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
        <Input
          placeholder="Search"
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm leading-normal text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-0"
        />
        <kbd className="pointer-events-none hidden shrink-0 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 font-sans text-[0.625rem] font-medium tracking-wide text-slate-500 sm:inline-block">
          ⌘ + F
        </kbd>
      </div>

      <div className="min-w-0 flex-1" aria-hidden />

      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="icon" className={headerIconButtonClass}>
          <Mail className="h-[17px] w-[17px]" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(headerIconButtonClass, "relative")}
              aria-label="Notifications"
            >
              <Bell className="h-[17px] w-[17px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[min(100vw-2rem,360px)] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-md [backdrop-filter:none]"
          >
            <div className="border-b border-slate-200 bg-white px-3 py-2.5">
              <p className="text-xs font-semibold text-slate-900">
                Recent notifications
              </p>
              <p className="text-xs leading-snug text-slate-500">
                Highest severity first — demo feed
              </p>
            </div>
            <ul className="max-h-[280px] overflow-y-auto bg-white py-1">
              <li>
                <Link
                  href="/alerts"
                  className="flex gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-red-50/80"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="min-w-0">
                    <span className="font-semibold text-slate-900">
                      Critical: Vent alarm parity
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      ER · acknowledged by nursing, biomed follow-up due in 30
                      min
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/maintenance"
                  className="flex gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-amber-50/80"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span className="min-w-0">
                    <span className="font-semibold text-slate-900">
                      PM batch: ICU infusion
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      5 devices under 30% battery — swap window suggested
                      tonight
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/fleet"
                  className="flex gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span className="min-w-0">
                    <span className="font-semibold text-slate-900">
                      Vendor channel update
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      Philips pushed firmware bundle v4.2 — staged for your
                      review
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
            <div className="border-t border-slate-200 bg-white p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-full justify-center text-xs font-semibold text-blue-700 hover:bg-blue-50"
                asChild
              >
                <Link href="/alerts">View all alerts</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-0.5 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-1.5 py-0 pr-2 text-sm shadow-none outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 data-[state=open]:bg-slate-50 sm:pr-2.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-slate-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces&auto=format&q=80"
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden max-w-[9rem] whitespace-nowrap font-normal leading-snug text-slate-800 sm:inline">
                Morgan Reyes
              </span>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-w-64 border-slate-200 bg-white text-slate-900 shadow-md [backdrop-filter:none]"
          >
            <DropdownMenuLabel className="flex items-start gap-3 bg-white font-normal text-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces&auto=format&q=80"
                alt="Morgan Reyes"
                width={32}
                height={32}
                className="shrink-0 rounded-full object-cover ring-1 ring-slate-200/80"
              />
              <div className="flex min-w-0 flex-col text-left">
                <span className="truncate text-sm font-normal leading-snug text-slate-900">
                  Morgan Reyes
                </span>
                <span className="truncate text-xs font-normal text-slate-500">
                  morgan.reyes@regency.med
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="h-4 w-4 opacity-60" aria-hidden />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 opacity-60" aria-hidden />
                <span>Account settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="h-4 w-4 opacity-60" aria-hidden />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
