import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import axios from 'axios';
import FaceIcon from '@material-ui/icons/Face';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import DeleteIcon from '@material-ui/icons/Delete';

import ModalChatroom from './Modals/ModalChatroom';
import { username$ } from './Observables/Store.js';

const Container = styled.aside`
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 250px;
  height: 100vh; 
  background: #3f0e40;
  color: #a892a8;
  border-top: 1px solid #9f87a0;

  .aside_title{
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 90%;
    border-bottom: 1px solid #b9a7b9;
    padding-left: 20px;
  }

  .user_container{
    display: flex;
    align-items: center;

  }

  .aside_main{
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    width: 100%;
  }

  .channelTitle_container{
    display:flex;
    align-items: center;
  }

  .channel_container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 30px;
  }

  .channel{
    cursor: pointer;
  }

  .addChatroom_btn{
    background-color: #008CBA;
    cursor: pointer;
    border: none;
    margin-bottom: 15px;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;

    :hover{
      background-color: #0780a8;
    }
  }

  .deleteChatroom_btn{
    border:none;
    cursor: pointer;
    color: #a892a8;
    background: #3f0e40;
  }
`

function Chatrooms(props) {
  const [channels, setChannels] = useState([]);
  const [createChannel, setCreateChannel] = useState(false);
  
  useEffect(() => {
    axios.get('/chatrooms')
      .then( (res) =>{
        setChannels(res.data.data)
      })
      .catch( (err) =>{
        console.log(err)
      })
  }, [channels])

  function handleModal(){
    setCreateChannel(!createChannel);
  }

  function handleDeleteChatroom (e){
    
    axios.delete(`/chatrooms/${e.target.dataset.id}`)
      .then( (res) =>{
      })
      .catch( (err) =>{
        console.log(err);
      })
  }

  return(
    <Container>
      <div className='aside_title'>
        <h3>Chatrooms</h3>
        <div className='user_container'>
          <FaceIcon style={{ paddingRight: '5px' }}/><p><b>{username$.value}</b></p>
        </div>
        <button className='addChatroom_btn' onClick={handleModal}>Add Channel</button>
      </div>
      <div className='aside_main'>
        <div className='channelTitle_container'>
          <MeetingRoomIcon style={{ paddingRight: '5px' }}/><p>Channels</p>
        </div>
        {channels.map( x =>(
          <div className='channel_container' key={x.id}>
            <p className='channel' onClick={props.handleJoinChannel} data-id={x.id}>{x.channel}</p>
            <button className='deleteChatroom_btn' data-id={x.id} onClick={handleDeleteChatroom} ><DeleteIcon style={{pointerEvents:'none'}}/></button>
          </div>
        ))}
      </div>
      {createChannel ? <ModalChatroom handleModal={handleModal} /> : null}
    </Container>
  )
}

export default Chatrooms;

