"use client";

import Image from "next/image";
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
import Link from "next/link";
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

export function Header() {
  return (
    <header className="flex h-[3.25rem] items-center justify-between gap-3 border-b border-slate-200/60 bg-white px-4 sm:gap-4 sm:px-6">
      <div
        className={cn(
          "relative min-w-0 flex-1 rounded-lg",
          "transition-[box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
          "has-[input:focus-visible]:shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
        )}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search devices, work orders, people…"
          className="h-9 rounded-lg border-slate-200/80 bg-slate-50/90 pl-10 pr-3 text-sm leading-normal text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] transition-[border-color,box-shadow] focus-visible:border-blue-300/70 focus-visible:ring-blue-500/25 sm:pr-[4.25rem]"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200/90 bg-slate-50 px-2 py-0.5 font-sans text-[0.625rem] font-medium tracking-wide text-slate-500 shadow-[0_1px_0_rgb(0_0_0/0.03)] sm:inline-block">
          ⌘F
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100/90 hover:text-slate-800"
        >
          <Mail className="h-[17px] w-[17px]" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100/90 hover:text-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-[17px] w-[17px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
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
                  className="flex gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-rose-50/80"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/90 px-1.5 py-0 pr-2 text-sm shadow-none outline-none transition-colors hover:bg-slate-100/90 focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 data-[state=open]:bg-slate-100/90 sm:pr-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 ring-1 ring-slate-200/60">
                <span className="text-[11px] font-semibold leading-none text-blue-800">
                  MR
                </span>
              </div>
              <span className="hidden max-w-[11rem] whitespace-nowrap font-normal leading-snug text-slate-800 sm:inline">
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
