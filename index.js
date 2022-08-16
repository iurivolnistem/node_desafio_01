const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next){
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if(!user){
        return response.status(400).json({error: "User not found!"});
    }

    return next();
}

app.post("/users", (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some((user) => user.username === username);

    if(userAlreadyExists){
        return response.status(400).json({error: "User already exists!"});
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })

    return response.status(201).send();
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.send(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const {title, deadline} = request.body;

    user.todos.push({
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    });

    return response.status(201).json(user.todos);
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { idTodo } = request.params;
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = user.todos.find(todo => todo.id === idTodo);

    if(!todo){
        return response.status(404).json({error: "Todo not found!"});
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todoAltered);
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    
    const todo = user.todos.find(todo => todo.id === id);

    if(!todo){
        return response.status(404).json({error: "Todo not found!"});
    }

    todo.done = true;

    return response.json(todo);
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    if(todoIndex === -1){
        return response.status(404).json({error: "Todo not found!"});
    }

    user.todos.splice(todoIndex, 1);

    return response.status(204).json(user.todos);
});

app.listen(3333);