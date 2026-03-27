import React from "react";

export default function ChatLayout({ sidebar, header, children, rightPanel }) {
  return (
    <div className="h-screen bg-slate-100 text-slate-900">
      <div className="h-full p-4 md:p-5">
        <div className="mx-auto flex h-full max-w-[1600px] gap-4">
          <aside className="flex w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {sidebar}
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {header}
            <div className="min-h-0 flex-1">{children}</div>
          </main>

          {rightPanel ? (
            <aside className="flex w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}