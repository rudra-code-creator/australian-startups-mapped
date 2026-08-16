import { AdminTabs } from "@/components/admin/AdminTabs";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white text-[color:var(--ink)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Review new startups and location fixes. Nothing goes live until approved.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AdminTabs />
        </div>
      </div>
    </main>
  );
}

