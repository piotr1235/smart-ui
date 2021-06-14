// Need to change to your server IP
const API_URL = 'http://192.168.1.200:5000/api';

const root = document.getElementById('root');

const loginPanel = document.createElement('div');
const createUser = document.createElement('div');
const allUsers = document.createElement('div');

root.appendChild(loginPanel);
root.appendChild(createUser);

// display all users with delete buttons
fetch(`${API_URL}/user` , { credentials: 'include' })
  .then((r) => r.json())
  .then((user) => {
    const ol = document.createElement('ol');
    ol.innerHTML = 'Table of users<br><br>';

    // iterate through all users
    user.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = `${user.username}: ${user.role}`; // display username with role in the table

      const deleteButton = document.createElement('span');
      li.appendChild(deleteButton);
      deleteButton.innerText = 'X';
      deleteButton.classList.add('delete-button');

      // add on click event listener
      deleteButton.onclick = (e) =>
        deleteUser(user.id).then((r) => {
          if (r.ok) location.reload();
          else alert('You are not an admin');
        });

      ol.appendChild(li);
    });
    root.appendChild(ol);
  });

// create one user
const createUserForm = document.createElement('form');
createUser.appendChild(createUserForm);

// add on submit functionality
createUserForm.onsubmit = function (e) {
  e.preventDefault();
  const inputs = this.getElementsByTagName('input');

  // handle username and password from input fields
  const username = inputs[0].value;
  const password = inputs[1].value;

  postData(`${API_URL}/user`, { username, password }).then((r) =>
    location.reload()
  );
};

// create form for adding users
createUserForm.innerText = 'Create new user';

const usernameInput = document.createElement('input');
const passwordInput = document.createElement('input');
const buttonInput = document.createElement('input');

usernameInput.setAttribute('placeholder', 'username');
passwordInput.setAttribute('type', 'password');
passwordInput.setAttribute('placeholder', 'password');
buttonInput.setAttribute('type', 'submit');

createUserForm.appendChild(usernameInput);
createUserForm.appendChild(passwordInput);
createUserForm.appendChild(buttonInput);

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// delete one user
async function deleteUser(id) {
  const r = await fetch(`${API_URL}/user/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return r;
}

// login panel
const loginForm = document.createElement('form');
loginForm.innerText = 'Login Panel';

const loginUsername = document.createElement('input');
const loginPassword = document.createElement('input');
const loginSubmit = document.createElement('input');
loginForm.appendChild(loginUsername);
loginForm.appendChild(loginPassword);
loginForm.appendChild(loginSubmit);

loginUsername.setAttribute('placeholder', 'username');
loginPassword.setAttribute('placeholder', 'password');
loginPassword.setAttribute('type', 'password');
loginSubmit.setAttribute('type', 'submit');

loginForm.onsubmit = function (e) {
  e.preventDefault();
  const inputs = this.getElementsByTagName('input');

  const username = inputs[0].value;
  const password = inputs[1].value;

  postData(`${API_URL}/user/login`, { username, password }).then((r) => {
    // if login successful then save token in cookie and reload the page
    if (r && r.accessToken) {
      setCookie('jwt', r.accessToken);
      location.reload();
    }
  });
};

/**
 * Check if the user is logged in
 * If so then display his name with logout button
 * If not then display login panel
 */
fetch(`${API_URL}/user/whoami`, { credentials: 'include' })
  .then((r) => {
    if (!r.ok) throw Error;
    return r.json();
  })
  .then((r) => {
    loginPanel.innerText = `Logged as: ${r}`;
    const logoutButton = document.createElement('button');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = function (e) {
      setCookie('jwt', '', -1);
      location.reload();
    };
    loginPanel.appendChild(logoutButton);
  })
  .catch((e) => {
    loginPanel.appendChild(loginForm);
  });

// add cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
