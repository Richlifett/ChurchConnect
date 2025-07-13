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
  socket.on('message', (msg) => socket.broadcast.emit('message', msg));
});
SERVER
```

## Contributing
1. Fork this repository and create a new branch for your feature or bug fix.
2. Install dependencies with `npm install` and run `npm run lint` before committing.
3. Open a pull request describing your changes.

Refer to the [Vite documentation](https://vitejs.dev/) and [React documentation](https://react.dev/) for more information about the underlying tools.
