const express = require('express');
const cors = require('cors');

const {v4: uuidv4} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(400).json({error: 'Conta não existe'})
  }
  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const data = {id: uuidv4(), name, username, todos: []}

  const verifyUser = users.find(user => user.username === username)

  if (!verifyUser) {
    users.push(data)
    return response.status(201).json(data)
  }


  return response.status(400).json({error: 'Conta já existe'})

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.status(200).json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const data = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(data)

  return response.status(201).json(data)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {id} = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({error: 'Not found Todo'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({error: 'Not found Todo'})
  }

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todoIndex = user.todos.findIndex(todo => todo.id === id)


  if (todoIndex === -1) {
    return response.status(404).json({error: 'Not found Todo'})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;