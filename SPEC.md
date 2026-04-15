# Web Chat Room Specification

## Project Overview
- **Project name**: Online Chat Room
- **Type**: Real-time web chat application (Next.js full-stack)
- **Core functionality**: A no-registration chat room where users join with username + room number, see online users, and messages clear on exit
- **Target users**: Anyone wanting quick anonymous chat

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Real-time**: Pusher (Presence Channels)
- **Styling**: Tailwind CSS
- **State**: React useState/useContext
- **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **Deployment**: Vercel

## UI/UX Specification

### Layout Structure
- **Single page app** with two views:
  1. Join screen (username + room number input)
  2. Chat room (main chat interface)

### Visual Design

#### Color Palette (Dark Mode - Default)
- **Background**: `#0a0a0f` (deep dark)
- **Card background**: `#12121a` (slightly lighter dark)
- **Primary accent**: `#6366f1` (indigo)
- **Secondary accent**: `#22d3ee` (cyan)
- **Text primary**: `#f1f5f9` (light gray)
- **Text secondary**: `#94a3b8` (muted gray)
- **Success**: `#10b981` (green - online indicator)
- **Border**: `#1e1e2e` (subtle border)

#### Color Palette (Light Mode)
- **Background**: `#f8fafc`
- **Card background**: `#ffffff`
- **Primary accent**: `#6366f1` (indigo)
- **Secondary accent**: `#0ea5e9` (sky blue)
- **Text primary**: `#0f172a` (dark slate)
- **Text secondary**: `#64748b` (muted slate)
- **Success**: `#10b981` (green)
- **Border**: `#e2e8f0` (light gray)

#### Theme Toggle
- Sun icon for switching to light mode
- Moon icon for switching to dark mode
- Persisted in localStorage
- Smooth 300ms transition between themes

#### Typography
- **Font family**: "DM Sans" (Google Fonts) with fallback to system-ui
- **Heading sizes**: 2rem (room title), 1.5rem (section headers)
- **Body text**: 0.875rem - 1rem
- **Username**: 0.75rem bold

#### Spacing System
- Base unit: 4px
- Card padding: 24px
- Message gap: 12px
- Section gap: 16px

#### Visual Effects
- Card shadows: `0 4px 24px rgba(0,0,0,0.4)`
- Input focus: 2px indigo ring
- Message bubbles: subtle gradient backgrounds
- User join/leave: fade animation (300ms ease)
- Scrollbar: thin, dark themed

### Components

#### Join Screen
- App title with gradient text effect
- Username input field (max 20 chars)
- Room number input field (numeric, 1-9999)
- "Join Room" button (indigo gradient, hover scale 1.02)
- Error message display (red text)

#### Chat Room
- **Header**: Room name + user count badge + username display
- **Sidebar** (left, 200px): Online users list with green dot indicators
- **Main area**:
  - Message list (scrollable, newest at bottom, with voice playback button)
  - Message input (fixed at bottom, with send button + voice input button)
- **Exit button**: Top-right, subtle styling

#### Message Types
- **Own messages**: Right-aligned, indigo background
- **Other messages**: Left-aligned, darker card background
- **System messages**: Center-aligned, italic, muted color (user join/leave)

## Functionality Specification

### Core Features

#### 1. Join Room
- User enters username (required, 2-20 chars, alphanumeric + spaces)
- User enters room number (required, 1-9999)
- Click "Join Room" to connect via Socket.IO
- Username stored in sessionStorage for persistence within tab

#### 2. Online Users List
- Sidebar shows all users currently in the room
- Green dot indicator for each online user
- User count in header badge
- Updates in real-time when users join/leave

#### 3. Messaging
- Text messages only (max 500 chars)
- Messages appear instantly for all users in room
- Messages are NOT stored on server - only delivered to currently connected users
- New messages auto-scroll to bottom

#### 4. Exit Room
- "Leave" button disconnects user
- All messages cleared from UI
- User removed from online users list
- Return to join screen

#### 5. Voice Input (一直监听模式)
- Click microphone button to start/stop voice listening
- Toggle mode: click to start, click again to stop
- Text appears in real-time in the input box (interim results)
- User manually sends message with Send button
- Uses Web Speech API (SpeechRecognition)
- Supports: Chrome, Edge, Safari 15.4+
- Visual feedback: red background + pulsing dot + "Listening..." text when active

#### 6. Voice Playback (点击播报)
- Click speaker icon on any message to read aloud
- Click again to stop playback
- Uses Web Speech API (SpeechSynthesis)
- Allows interrupting current playback
- Speaker icon only shown on other users' messages

### Socket Events (Pusher)

#### Pusher Channels
- Presence channel: `presence-room-{room}` - tracks online users
- Event: `pusher:subscription_succeeded` - user list loaded
- Event: `pusher:member_added` - user joined
- Event: `pusher:member_removed` - user left
- Event: `client-message` - real-time message (client-triggered)

### Edge Cases
- Duplicate username in same room: reject with error
- Empty username/room: show validation error
- Server disconnect: show reconnection message
- Very long messages: truncate at 500 chars client-side

## File Structure
```
/app
  /page.tsx           - Main entry (join screen)
  /chat/page.tsx      - Chat room page
  /api/pusher-auth/route.ts  - Pusher authentication
  /api/pusher-trigger/route.ts - Pusher event trigger
/components
  /JoinForm.tsx
  /ChatRoom.tsx
  /MessageList.tsx
  /MessageInput.tsx
  /UserList.tsx
  /ThemeToggle.tsx    - Theme switcher button
  /ThemeProvider.tsx  - Theme context provider
  /VoiceInput.tsx     - Voice input (click to toggle)
  /VoicePlayback.tsx  - Voice playback (click to speak)
/lib
  /pusher.ts          - Pusher client singleton
/server
  /pusher.ts          - Pusher server instance
```

## Acceptance Criteria
1. User can join a room with just username + room number (no password)
2. Users see real-time list of who's online in their room
3. Messages from before joining are not visible
4. Exiting room clears all messages from UI
5. Multiple rooms work independently (users in room A don't see room B messages)
6. Smooth animations and responsive design
7. Voice input works by pressing and holding microphone button
8. Voice playback works by clicking speaker icon on messages
