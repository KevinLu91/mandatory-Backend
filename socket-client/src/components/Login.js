import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { username$, updateUsername } from './Observables/Store.js';
import axios from 'axios';

function Login(){
  const [user, setUser] = useState('');
  const [validate, setValidate] = useState(false);
  
  function handleOnchange(e) {
    setUser(e.target.value);
  }

  function handleOnSubmit(e){
    e.preventDefault();

    axios.post('/users', {username: user})
      .then( (res) =>{
        console.log(res);
        updateUsername(user);
        setValidate(true);
      })
      .catch( (err) =>{
        console.log(err)
      })
  }

  if(validate || username$.value){
    return <Redirect to='/' />
  }

  return(
    <>
      <form onSubmit={handleOnSubmit}>
        <label><b>Username</b></label>
        <input 
          onChange={handleOnchange}
          type='text'
          value={user}
          placeholder='Enter Username'
          required
        />
        <button typ='submit'>Login</button>
        
      </form>
    </>
  )
}

export default Login;