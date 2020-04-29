import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.width + 'px'};
  height: 100%;
  background-color: rgb(70,70,70, 0.5);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  .modal_container{
    display:flex;
    flex-direction: column;
    width: 300px;
    height: 300px;
    background: white;
    color: black;
    border-radius: 5px;
    padding: 25px;
  }

  .modal_footer{
    display: flex;
    justify-content: flex-end;
  }

  button{
    margin: 15px;
  }
`

function ModalChatroom(props){
  const [channelName, setChannelName] = useState('');

  function handleOnChange(e){
    setChannelName(e.target.value);
  }

  function handleSubmit(){
    axios.post('/chatrooms', {channel: channelName})
      .then( (res) => {
        console.log(res)
        props.handleModal();
      })
      .catch( (err) =>{
        console.log(err)
      })
  }
  
  
  return(
    <Container width={window.innerWidth}>
      <div className='modal_container'>
        <h3>Create a channel:</h3>
        <p>Channels are where your team communicates.</p>
        <p>They're best when organized around a topic</p>
        <input onChange={handleOnChange} type='text' maxLength='18'/>
        <div className='modal_footer'>
          <button onClick={props.handleModal}>Close</button>
          <button onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </Container>
  )
}

export default ModalChatroom;