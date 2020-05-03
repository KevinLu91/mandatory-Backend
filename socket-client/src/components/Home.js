import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

import { username$, updateUsername } from './Observables/Store.js'
import Chatrooms from './Chatrooms';


const socket = io('http://localhost:8080');

const Container = styled.div`

  header{
    display:flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    color: white;
    background: #350d36;
  }

  .Logout_btn{
    background-color: #008CBA;
    border: none;
    cursor: pointer;
    color: white;
    padding: 10px 25px;
    height: 30px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
  }

  main{
    display: flex;
  }

  .main_container{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
  }

  .chat_container{
    width: 100%;
    height: 400px;
    overflow-y: auto;
    border: 1px solid black;
  }

  .message_container{
    padding: 8px 20px;
    border-bottom: 1px solid rgb(220,220,220);
    
  }

  form{
    display:flex;
    position: fixed;
    bottom: 30px;
    width: 50%;
    height: 10%;
    right: 20%;
  }

  form input{
    display:flex;
    width: 100%;
  }

  .chatUser_container{
    width: 200px;
    background: #3f0e40;
    color: #a892a8;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-top: 1px solid #9f87a0;
  }

  .user_online{
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: start;
  }

  .online{
    margin: 12px 10px 8px 10px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: green;
  }


`

function Home() {
  const [chatroom, setChatroom] = useState('');
  const [message, setMessage] = useState('');
  const [id, setId] = useState('');
  const [validation, setValidation] = useState(true);
  const [name] = useState(username$.value);
  const [chatUsers, setChatUsers] = useState([]);

  
  useEffect(() => { 
    if(chatroom){
      socket.on('new_message', (data) =>{
        if(chatroom.id === data.id){
          setChatroom( chatroom =>({
            ...chatroom,
            messages: [...chatroom.messages, data.message]
          }))
       }
      })
    }
    return () =>{
      socket.off('new_message')
    }
  },[chatroom])

  useEffect(() =>{
    
    if(chatroom){
      socket.emit('join', ({ name, room: chatroom.channel }))
    }
       socket.on('roomData', ({users}) =>{
        setChatUsers(users)
      }) 
    return () =>{
      socket.off('roomData')
    }
  }, [chatroom, name])

  useEffect(() =>{
    socket.emit('leave')
  },[id])
 


  if(!username$.value || !validation){
    return <Redirect to='/Login' />
  }
  
  function handleLogOut(){
    updateUsername(null);
    setValidation(false);
    socket.emit('leave', ({ name, room: chatroom.channel}))
  }
    
  function handleJoinChannel(e){
    
    setId(e.target.dataset.id) 
    
    axios.get(`/chatrooms/${e.target.dataset.id}`)
    .then( (res) =>{
      setChatroom(res.data);
    })
    .catch( (err) =>{
      console.log(err);
    }) 

  }

  function handleMessage(e){
    setMessage(e.target.value)
  }

  function handleSendMessage(e){
    e.preventDefault();

    axios.post(`/chatrooms/${id}/chat`, {user: username$.value, message: message})
      .then( (res) =>{
        console.log(res)
        setMessage('');
      })
      .catch( (err) =>{
        console.log(err)
      })
  }

  return (
    <Container>
      <header>
        <h3>EC Backend</h3>
        <button className='Logout_btn' onClick={handleLogOut}>Logout</button>
      </header>
      <main>
        <Chatrooms handleJoinChannel={handleJoinChannel}/>
        <div className='main_container'>
         {chatroom ? <h3>Channel: #{chatroom.channel}</h3> : <h3>Home Page</h3>}
         <div className='chat_container'>
           {chatroom ? chatroom.messages.map( (x,i) =>(
             <div className='message_container' key={i}>
               <p><b>{x.user}:</b></p>
              <p>{x.message}</p>
            </div>
          )) 
          : null}
         {chatroom ? 
           <form onSubmit={handleSendMessage}>
             <input 
              onChange={handleMessage}
              value={message}
              />
             <button type='submit'>Send</button>
           </form>
           : null
          }
          </div>  
       </div>
      <div className='chatUser_container'>
        <h3>Channel users:</h3>
        {chatUsers ? chatUsers.map( (x,i) =>(
          x.room === chatroom.channel ?
          <div key={i} className='user_online'>
            <div className='online'></div><h3>{x.name}</h3>
          </div> : null
        )): null}
      </div>
      </main>
    </Container>
  );
}

export default Home;