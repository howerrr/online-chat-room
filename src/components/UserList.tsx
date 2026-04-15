"use client";

type User = {
  id: string;
  username: string;
};

export default function UserList({ users }: { users: User[] }) {
  return (
    <div
      className="w-48 p-4 rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>
        Online ({users.length})
      </h2>
      <div className="space-y-2">
        {users.map((user, index) => (
          <div key={`${user.id}-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--success)" }}
            />
            <span className="text-sm truncate" style={{ color: "var(--foreground)" }}>
              {user.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
