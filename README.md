# ChurchConnect

ChurchConnect is a web platform for church communities to host video meetings and schedule events. It combines React, Vite and Tailwind CSS to offer a simple interface for video calls and calendar management.

## Prerequisites
- **Node.js 18+** and npm installed.

## Install dependencies
```bash
npm install
```

## Run in development
```bash
npm run dev
```
This starts the Vite development server at `http://localhost:5173`.

## Build for production
```bash
npm run build
```
The compiled files are created in `dist/`. You can preview the production build with:
```bash
npm run preview
```

## Chat
The video conference includes a simple chat panel powered by Socket.IO. When a meeting starts the client connects to `http://localhost:3001` to send and receive messages.

To test chat locally you can run a minimal Socket.IO server:

```bash
npm install socket.io
node - <<'SERVER'
const { Server } = require('socket.io');
const io = new Server(3001, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('privateMessage', ({ targetId, ...msg }) => {
    // `targetId` should be the socket.id of the recipient
    // Only the matching client will receive this event
    socket.to(targetId).emit('privateMessage', msg);
  });

  socket.on('message', (msg) => io.emit('message', msg));
});
SERVER
```

The server prints each participant's `socket.id` when they connect. You can read
your own ID via `socket.id` on the client. When a client emits a
`privateMessage` event it should include `targetId` with the recipient's
`socket.id`. The server then forwards the payload using
`socket.to(targetId).emit('privateMessage', msg)` so only that client receives
it.

To test private chats:

1. Open the app in two browser tabs so two clients connect.
2. Note the socket IDs from the server logs.
3. In one tab's developer console run:

   ```js
   const { chatService } = await import('/src/services/chat');
  // Send a private message
  chatService['socket']?.emit('privateMessage', {
    targetId: '<other-id>',
    id: Date.now().toString(),
    sender: 'You',
    text: 'Hello privately',
    timestamp: new Date()
  });

  // Listen for incoming private messages
  chatService['socket']?.on('privateMessage', (msg) => {
    console.log('Private:', msg);
  });
   ```

The message only appears in the tab whose ID matches `targetId`.

## Contributing
1. Fork this repository and create a new branch for your feature or bug fix.
2. Install dependencies with `npm install` and run `npm run lint` before committing.
3. Open a pull request describing your changes.

Refer to the [Vite documentation](https://vitejs.dev/) and [React documentation](https://react.dev/) for more information about the underlying tools.
