import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json()); // 제이슨으로 파싱해서 옴
app.use(express.urlencoded({ extended: true })); // 자료형에 맞게 변환해서 줌

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

let users = new Set();

io.on('connection', (socket) => {
  console.log(socket);
  users.add(socket.id);
  io.emit('entry', {id:socket.id,users:[...users]}); // 들어오면 모두에게 입장을 알림
  console.log('a user connected');
  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('exit', {id:socket.id,users:[...users]}); 
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', socket.id + msg ); // 한 클라이언트가 말하면 모두에게 msg를 알림
    console.log('message: ' + msg);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});