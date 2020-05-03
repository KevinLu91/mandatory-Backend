const express = require('express');
const fs = require('fs');
const uuid = require('uuid');
const chatrooms = require('./chatrooms');
const app = express();
const PORT = process.env.PORT || 8080;

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

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

app.get('/users/:id', (req, res) =>{
  let id = req.params.id;

  let user = users.find((user) =>{
    return user.id === id;
  })

  if(user){
    res.status(200).json(user)
    return;
  } else{
    res.status(400).end();
    return;
  }
})

app.post('/users', (req, res) =>{
  let user = req.body;

  if(!user.username){
    res.status(400).end();
    return;
  }

  user.id = uuid.v4();
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

app.post('/chatrooms/:id/users', (req, res) =>{
  let body = req.body;
  let id = req.params.id;

  if(!body.users){
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

  chatrooms[chatroomIndex].users.push(body)
  res.status(200).send(body);
  saveChatroom();
  return;
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

app.delete('/users/:id', (req, res) =>{
  let id = req.params.id;

  let userIndex = users.findIndex((user) =>{
    return user.id === id;
  })

  if(userIndex === -1){
    res.status(400).end();
    return;
  }

  users.splice(userIndex, 1);
  saveUser();
  res.status(200).end();

})

app.delete('/chatrooms/:id', (req, res) =>{
  let id = req.params.id;
  
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

  socket.on('join', ({name, room}) =>{
    const user = addUser({ id: socket.id, name, room });
    roomUsers = getUsersInRoom(user.room);
    
    roomUsers = roomUsers.filter((elem, index, self) => self.findIndex(
      (t) => {return ( t.name === elem.name)}) === index)

    socket.join(user.room);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: roomUsers,
    });

    console.log(user)
    

  socket.on('leave', () =>{
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
    console.log('leave', user)
    })
  })

  socket.on('disconnect', () =>{
    const user = removeUser(socket.id);
    console.log(user)
    if(user){
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
 
  socket.on('new_message', (data) =>{
    socket.emit('message', data);
  });
})

http.listen(PORT, () =>{
  console.log(`Listening on ${PORT}`);
})