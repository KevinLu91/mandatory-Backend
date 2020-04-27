const express = require('express');
const fs = require('fs');
const uuid = require('uuid');
const chatrooms = require('./chatrooms');
const app = express();
const PORT = 8080;

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const USERS_PATH = 'users.json';

fs.readFile(USERS_PATH, (err, data) => {
  if (err) throw err;
  
  users = JSON.parse(data);
});

function saveUser() {
  return new Promise((resolve, reject) => {
    fs.writeFile(USERS_PATH, JSON.stringify(users), function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function saveChatroom() {
  return new Promise((resolve, reject) => {
    fs.writeFile('./chatrooms.json', JSON.stringify(chatrooms), function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.use(express.json());

app.get('/users', (req, res) =>{
  res.send({users});
})

app.post('/users', (req, res) =>{
  let user = req.body;

  if(!user.username){
    res.status(400).end();
    return;
  }

  users.push(user);
  saveUser();
  res.status(201).send(user);
})

app.get('/chatrooms', (req, res) =>{
  res.json({
    data: chatrooms
  })
})

app.get('/chatrooms/:id', (req, res) =>{
  let id = req.params.id;

  let chatroom = chatrooms.find((chatroom) =>{
    return chatroom.id === id;
  })

  if(chatroom){
    res.status(200).json(chatroom);
    return;
  } else{
    res.status(400).end();
  }
})

app.post('/chatrooms', (req, res) =>{
  let chatroom = req.body;

  if(!chatroom.channel){
    res.status(400).end();
    return;
  }

  chatroom.id = uuid.v4();
  chatroom.messages = [];
  chatrooms.push(chatroom);
  saveChatroom()
  res.status(201).send(chatroom);
})

app.post('/chatrooms/:id/chat', (req, res) =>{
  let id = req.params.id;
  let message = req.body;

  if(!message.user || !message.message){
    res.status(400).end();
    return;
  }

  let chatroomIndex = chatrooms.findIndex( (chatroom) =>{
    return chatroom.id === id;
  })

  if(chatroomIndex === -1){
    res.status(400).end();
    return;
  }

  chatrooms[chatroomIndex].messages.push(message);
  res.status(201).send(message);
  io.emit('new_message', {id, message});
  saveChatroom()
})

app.delete('/chatrooms/:id', (req, res) =>{
  let id = req.params.id
  
  let chatroomIndex = chatrooms.findIndex( (chatroom) =>{
    return chatroom.id === id;
  })

  if(chatroomIndex === -1){
    res.status(400).end();
    return;
  }

  chatrooms.splice(chatroomIndex, 1);
  saveChatroom();
  res.status(200).end();
})


io.on('connection', (socket) =>{
  console.log('a user connected');

  socket.on('new_message', (data) =>{
    socket.emit('message', data);
  });
})

http.listen(PORT, () =>{
  console.log(`Listening on ${PORT}`);
})