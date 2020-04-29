import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { username$ } from './Observables/Store';

function Users(props) {
  const [activeUsers, setActiveUsers] = useState(null); 

  useEffect(() =>{
    axios.get('/users')
      .then( (res) =>{
        setActiveUsers(res.data.users)
        CheckUser()
      })
      .catch( (err) =>{
        console.log(err)
      })
      
  },[activeUsers])

  function CheckUser() {
    if(activeUsers){
      for(const user of activeUsers){
        if(user.username === username$.value){
          props.setActiveUser(user);
        }
      }
    }
  }

  return(
    <div>
      {activeUsers ? activeUsers.map( x =>(
        <div key={x.id}>
          <p>{x.username}</p>
        </div>
      )) : null}
    </div>
  )
}

export default Users;