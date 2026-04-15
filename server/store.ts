type User = {
  id: string;
  username: string;
};

type Room = Set<User>;

const rooms = new Map<string, Room>();

export function addUser(roomId: string, user: User): User[] {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  const room = rooms.get(roomId)!;
  room.add(user);
  return getRoomUsers(roomId);
}

export function removeUser(roomId: string, userId: string): User[] {
  const room = rooms.get(roomId);
  if (room) {
    for (const user of room) {
      if (user.id === userId) {
        room.delete(user);
        break;
      }
    }
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }
  return getRoomUsers(roomId);
}

export function getRoomUsers(roomId: string): User[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room).map((u) => ({ id: u.id, username: u.username }));
}

export function isUsernameTaken(roomId: string, username: string, currentUserId: string): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;
  for (const user of room) {
    if (user.username.toLowerCase() === username.toLowerCase() && user.id !== currentUserId) {
      return true;
    }
  }
  return false;
}
