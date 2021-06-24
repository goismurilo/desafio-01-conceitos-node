const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  
  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const check = users.find((user) => user.username === username);

  if (check) {
    return response.status(400).json({ error: "User Exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = request.user;
  
  return response.json(user.todos);
}); 

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = request.user;

  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not Found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = request.user;


  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not Found!"});
  }

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = request.user;


  const todoIndex = user.todos.findIndex((todos) => todos.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not Found!"});
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();

});

module.exports = app;