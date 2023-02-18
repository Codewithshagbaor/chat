var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

mongoose.Promise = Promise;

var dbUrl = 'mongodb+srv://AKEST:Akestmybaby001@cluster0.f0ezraz.mongodb.net/?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, message) => {
        res.send(message);
    });
});

app.post('/messages', async (req, res) => {
    var message = new Message(req.body);

    var savedMessage = await message.save();
    
    console.log('saved');

    var censored = await Message.findOne({message: 'badword'});
    if(censored) {
        await Message.remove({_id: censored.id});            
    } else {
        io.emit('message', req.body);
    }

    res.sendStatus(200); 

//    .catch((err) => {
//        res.sendStatus(500);
//        return console.error(err);
//    });

});

io.on('connection', (socket) => {
    console.log('A user connected');    
});

mongoose.connect(dbUrl, (err) => {
    console.log('MongoDB connection error: ', err);    
});

var server = http.listen(3000, () => {
    console.log('Server is listening on http://localhost:' + server.address().port);
    
}) 