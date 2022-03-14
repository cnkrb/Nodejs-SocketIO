const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let users = [];

io.on('connection', (socket) => {
    console.log('User Connected');

    socket.on("connectUser", function(data) {
        console.log('User Online = ' + data)
        let newUser = []
        let sameUserError = false
        for (let i=0; i<users.length; i++) {
            if (users[i]["userName"] === data) {
                sameUserError = true
                break;
            }
        }
        if(sameUserError){
            io.to(socket.id).emit("error",{error:"Aynı kullanıcı ismi kullanılamaz!"});
        }else {
            newUser["id"] = socket.id
            newUser["userName"] = data
            users.push(newUser)
            io.emit("users", {userName:data});
        }
    });

    socket.on('userToMessage', function(message,sendUserName){
        let id;
        for (let i=0; i<users.length; i++) {
            if (users[i]["userName"] === sendUserName) {
                id = users[i]["id"]
                break;
            }
        }

        let userName;
        for (let i=0; i<users.length; i++) {
            if (users[i]["id"] === socket.id) {
                userName = users[i]["userName"]
                break;
            }
        }

        let current = new Date()
            .toLocaleTimeString('tr-TR', { hour: 'numeric', minute: 'numeric' });

        io.to(socket.id).emit("getUserMessage", {message:message,receiverUserName:sendUserName,date:current})
        io.to(id).emit("getUserMessage", {message:message,receiverUserName:sendUserName,date:current})
    });

    socket.on('exitUserList', function(data){
        let userName;
        for (let i=0; i<users.length; i++) {
            if (users[i]["id"] === socket.id) {
                userName = users[i]["userName"]
                users.splice(i, 1);
                break;
            }
        }
        io.emit("exitUser", {userName:data})
    });

    socket.on('disconnect', function(){
        console.log('User Disconnected')
        let userName;
        for (let i=0; i<users.length; i++) {
            if (users[i]["id"] === socket.id) {
                userName = users[i]["userName"]
                users.splice(i, 1);
                break;
            }
        }
        io.emit("exitUser", {userName:userName})
    });

});

server.listen(3000, () => {
    console.log('listening on *:80')
});