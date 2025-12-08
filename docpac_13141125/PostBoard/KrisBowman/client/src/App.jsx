import React, { useState } from 'react';
import JobPostList from './components/JobPostList';
import NewJobPostForm from './components/NewJobPostForm';

function App() {
  const [username, setUsername] = useState(null);

  const login = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth-url');
      const data = await response.json();
      window.location.href = data.authURL;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  function getUsername() {
    fetch('http://localhost:3001/api/user', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setUsername(data.username); // Update the username state
        let userDisplay = document.getElementById('userDisplay');
        userDisplay.textContent = (`Welcome ${data.username}`);
      })
      .catch(error => {
        console.error('Error fetching username:', error);
      });
  };

  getUsername();

  return (
    <>
      <div>
        <button onClick={login}>Formbar Oauth</button>
        <div id="userDisplay"></div>
        <JobPostList username={username}/>
        {username && <NewJobPostForm />}
      </div>
    </>
  )
};

export default App