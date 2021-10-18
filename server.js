// const express = require('express');
// const http = require('http');
// const path = require('path');

// const app = express();

// const port = process.env.PORT || 3001;

// app.use(express.static(__dirname + '/dist/save-a-seat'));

// app.get('/*', (req,res) => {
//     res.sendFile(path.join(__dirname));
// });

// const server = http.createServer(app);

// server.listen(port, () => console.log('Server Running...'));


// ** other tut **
const express = require('express');
const app = express();

app.get('/getData', (req, res) => {
    res.json({
        "statusCode": 200,
        "statusMessage":"SUCCESS"
    })
});

app.listen(3000, (req,res) => {
    console.log('Express API is running at port 3000');
});

// https://malcoded.com/posts/angular-backend-express/ example
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors');
const { updateRestTypeNode } = require('typescript');

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))

app.route('/api/cats').get((req,res) => {
    res.send({
        cats: [
            {name: 'lilly'},
            {name: 'lucy'}
        ]
    })
});

app.route('/api/cats/:name').get((req, res) => {
    const requestedCatName = req.params['name'];
    res.send({ name: requestedCatName });
})

// POST
app.route('/api/cats').post((req, res) => {
    res.send(201, req.body)
})

// PUT
app.route('/api/cats/:name').put((req, res) => {
    res.send(200, req.body)
})

// DELETE
app.route('/api/cats/:name').delete((req, res) => {
    res.sendStatus(204)
})

// SAVE A SEAT END POINTS
app.route('/api/getUserBookings').post((req, res) => {
    if(!req.body.userID) {
        res.status(400).send('Invalid user ID');
    }
    else {
        let userBookings = [];
        dates.forEach(date => {
            date.booked.forEach(booking => {
                if (booking.userID === parseInt(req.body.userID)) {
                    tmpBooking = {...booking, date: date.date}
                    userBookings.push(tmpBooking);
                }
            })
        });

        res.status(200).send(userBookings);
    }
});

app.route('/api/users').post((req, res) => {
    const user = users.find(user => 
        user.email === req.body.email && user.password === req.body.password
    );
    
    if (user) {
        res.status(200).send(user);
    }
    else {
        res.status(400).send('email or password incorrect');
    }
})

app.route('/api/userSignup').post((req, res) => {
    console.log('userSignup', req);

    const doesUserExist = users.findIndex(user => user.email === req.body.email);
    if (!doesUserExist) {
        res.status(400).send('email already exists');
    }
    else {
        const sortedUsers = users.sort((a,b) => a.id > b.id ? 1 : -1);
        const newID = sortedUsers[sortedUsers.length];
        const newUser = {
            id: newID,
            email: 'req.body.email',
            password: 'req.body.password',
            firstName: 'req.body.firstName',
            lastName: 'req.body.lastName'
        }
        
        users.push(newUser);
        console.log('added user', users);
    
        res.status(200).send({
          firstName: newUser.firstName,
            lastName: newUser.lastName
        });
    }

});

app.route('/api/date/:date').get((req, res) => {
    if(req.params.date && req.params.date.length) {
        const requestedDate = dates.find(date => date.date === req.params.date);
        res.status(200).send(requestedDate);
    }
});

app.route('/api/confirmBooking').post((req,res) => {
    // confirm data
    if (!req.body.date.length || !req.body.seat) {
        res.status(400).send('missing a date or seat value');
    }
    else if (!req.body.userID) {
        res.status(400).send('Invalid user ID');
    }
    else {
        // confirm that the seat ID is not in the booked array for the requested day
        console.log('confirm', req.body);
        const selectedDateIndex = dates.findIndex(date => date.date === req.body.date);
        const seatIndex = dates[selectedDateIndex].booked.findIndex(seat => seat.id === req.body.seat);

        if(seatIndex >= 0) {
            res.status(400).send('Seat ' + req.body.seat + ' has already been booked for the date: ' + req.body.date);
        }
        else {
            // find seat in available array and move it to the booked array
            // const seatIndex = selectedDate.available.findIndex(seat => seat.id === req.body.seat);
            // const seatToMove = selectedDate.available.splice(seatIndex, 1);
            // selectedDate.booked.push(seatToMove[0]);

            const availIndex = dates[selectedDateIndex].available.findIndex(seat => seat.id === req.body.seat);
            let seatToMove = dates[selectedDateIndex].available.splice(availIndex, 1)[0];
            seatToMove.userID = parseInt(req.body.userID);
            dates[selectedDateIndex].booked.push(seatToMove);

            res.status(200).send(true);
        }
    }
});

app.route('/api/cancelBooking').post((req,res) => {
    if (!req.body.date || !req.body.id) {
        res.status(400).send('Invalid date or booking ID.');
    }
    else {
        const dateIndex = dates.findIndex(date => date.date === req.body.date);
        const bookingIndex = dates[dateIndex].booked.findIndex(booking => booking.id === parseInt(req.body.id));
        let cancelledBooking = dates[dateIndex].booked.splice(bookingIndex, 1)[0];
        cancelledBooking.userID = 0;
        dates[dateIndex].available.push(cancelledBooking);
        dates[dateIndex].available.sort((a,b) => a.id > b.id ? 1 : -1);
        res.status(200).send(true);
    }
});

app.route('/api/updateBooking').put((req,res) => {

    // req.body {date, newSeat, oldSeat, userID}
    if (!req.body) {
        res.status(400).send('missing information');
    }
    else {
        // 1. find date in dates array
        const dateIndex = dates.findIndex(date => date.date === req.body.date);
        // 2. find booking in date.booked array
        const bookingIndex = dates[dateIndex].booked.findIndex(booking => booking.id === parseInt(req.body.oldSeat));
        // 3. move booking to date.available array
        let cancelledBooking = dates[dateIndex].booked.splice(bookingIndex, 1)[0];
        cancelledBooking.userID = 0;
        dates[dateIndex].available.push(cancelledBooking);
        dates[dateIndex].available.sort((a, b) => a.id > b.id ? 1 : -1);
        // 4. find seat in available array and move to booked array
        const newBookingIndex = dates[dateIndex].available.findIndex(seat => seat.id === parseInt(req.body.newSeat));
        let newBooking = dates[dateIndex].available.splice(newBookingIndex, 1)[0];
        newBooking.userID = parseInt(req.body.userID);
        console.log('newBooking', newBooking);
        dates[dateIndex].booked.push(newBooking);
        dates[dateIndex].booked.sort((a, b) => a.id > b.id ? 1 : -1);
        res.status(200).send(true);
    }
});

// SAVE A SEAT TEST DATA
let users = [
    {
        id: 17,
        email: 'test@email.com',
        password: 'password',
        firstName: 'Demo',
        lastName: 'User'
    }
]

let dates = [
    {
        "date": "2021-10-15",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 11
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 21
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 32
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 1
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 52
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 3
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 64
            }
        ]
    },
    {
        "date": "2021-10-16",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 54
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 146
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 5
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 26
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 25
            }
        ]
    },
    {
        "date": "2021-10-17",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 85
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 41
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 51
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 68
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 17
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 24
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 2
            }
        ]
    },
    {
        "date": "2021-10-18",
        "available": [
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 25
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 82
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 116
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 116
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 119
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 23
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 8
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 67
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 146
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 125
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 112
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 68
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 6
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 100
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 41
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 15
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 44
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 2
            }
        ]
    },
    {
        "date": "2021-10-19",
        "available": [
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 53
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 67
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 139
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 76
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 52
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 148
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 113
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 85
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 107
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 39
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 17
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 6
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 63
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 144
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 129
            }
        ]
    },
    {
        "date": "2021-10-20",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 77
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 8
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 93
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 136
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 46
            }
        ]
    },
    {
        "date": "2021-10-21",
        "available": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 71
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 51
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 26
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 63
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 9
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 127
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 61
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 42
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 102
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 139
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 117
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 3
            }
        ]
    },
    {
        "date": "2021-10-22",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 63
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 61
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 52
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 1
            }
        ]
    },
    {
        "date": "2021-10-23",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 81
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 139
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 37
            }
        ]
    },
    {
        "date": "2021-10-24",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": []
    },
    {
        "date": "2021-10-25",
        "available": [
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 6
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 114
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 95
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 19
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 110
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 109
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 58
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 138
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 69
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 109
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 142
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 138
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 128
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 72
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 77
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 108
            }
        ]
    },
    {
        "date": "2021-10-26",
        "available": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 124
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 67
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 97
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 74
            }
        ]
    },
    {
        "date": "2021-10-27",
        "available": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 130
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 126
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 111
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 7
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 140
            }
        ]
    },
    {
        "date": "2021-10-28",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 105
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 38
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 51
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 44
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 44
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 103
            }
        ]
    },
    {
        "date": "2021-10-29",
        "available": [
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 51
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 143
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 146
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 122
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 12
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 91
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 81
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 35
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 39
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 11
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 79
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 55
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 21
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 11
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 148
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 77
            }
        ]
    },
    {
        "date": "2021-10-30",
        "available": [
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 7
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 3
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 62
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 66
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 91
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 33
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 78
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 114
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 41
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 75
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 47
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 45
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 98
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 110
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 144
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 81
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 100
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 132
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 73
            }
        ]
    },
    {
        "date": "2021-10-31",
        "available": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 127
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 69
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 2
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 51
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 85
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 86
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 27
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 10
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 75
            }
        ]
    },
    {
        "date": "2021-11-01",
        "available": [
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 104
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 46
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 124
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 83
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 60
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 59
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 72
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 9
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 100
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 138
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 71
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 139
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 129
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 34
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 45
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 145
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 147
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 61
            }
        ]
    },
    {
        "date": "2021-11-02",
        "available": [
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 40
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 28
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 96
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 105
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 58
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 131
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 54
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 75
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 67
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 119
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 99
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 118
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 99
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 51
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 135
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 21
            }
        ]
    },
    {
        "date": "2021-11-03",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 4
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 67
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 66
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 2
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 108
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 49
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 117
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 101
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 80
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 136
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 122
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 75
            }
        ]
    },
    {
        "date": "2021-11-04",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 126
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 98
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 128
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 125
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 33
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 122
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 68
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 148
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 130
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 58
            }
        ]
    },
    {
        "date": "2021-11-05",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 81
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 132
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 36
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 120
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 92
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 142
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 24
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 29
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 92
            }
        ]
    },
    {
        "date": "2021-11-06",
        "available": [
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 147
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 123
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 131
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 119
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 95
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 121
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 52
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 79
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 8
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 62
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 59
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 18
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 109
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 117
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 9
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 19
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 130
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 120
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 50
            }
        ]
    },
    {
        "date": "2021-11-07",
        "available": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 130
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 60
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 1
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 149
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 41
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 110
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 71
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 67
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 116
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 123
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 38
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 122
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 148
            }
        ]
    },
    {
        "date": "2021-11-08",
        "available": [
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 124
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 127
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 110
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 26
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 126
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 113
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 93
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 62
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 79
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 79
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 42
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 27
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 113
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 51
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 114
            }
        ]
    },
    {
        "date": "2021-11-09",
        "available": [
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 144
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 44
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 41
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 58
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 148
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 65
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 57
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 115
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 26
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 69
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 89
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 48
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 141
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 115
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 113
            }
        ]
    },
    {
        "date": "2021-11-10",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 37
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 100
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 40
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 60
            }
        ]
    },
    {
        "date": "2021-11-11",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 29
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 146
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 76
            }
        ]
    },
    {
        "date": "2021-11-12",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 0
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 12
            },
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 62
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 21
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 28
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 38
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 14
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 59
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 110
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 129
            }
        ]
    },
    {
        "date": "2021-11-13",
        "available": [
            {
                "id": 1,
                "name": "Seat #1",
                "seat": 1,
                "userID": 0
            },
            {
                "id": 2,
                "name": "Seat #2",
                "seat": 2,
                "userID": 0
            },
            {
                "id": 4,
                "name": "Seat #4",
                "seat": 4,
                "userID": 0
            },
            {
                "id": 5,
                "name": "Seat #5",
                "seat": 5,
                "userID": 0
            },
            {
                "id": 6,
                "name": "Seat #6",
                "seat": 6,
                "userID": 0
            },
            {
                "id": 7,
                "name": "Seat #7",
                "seat": 7,
                "userID": 0
            },
            {
                "id": 8,
                "name": "Seat #8",
                "seat": 8,
                "userID": 0
            },
            {
                "id": 10,
                "name": "Seat #10",
                "seat": 10,
                "userID": 0
            },
            {
                "id": 11,
                "name": "Seat #11",
                "seat": 11,
                "userID": 0
            },
            {
                "id": 13,
                "name": "Seat #13",
                "seat": 13,
                "userID": 0
            },
            {
                "id": 14,
                "name": "Seat #14",
                "seat": 14,
                "userID": 0
            },
            {
                "id": 16,
                "name": "Seat #16",
                "seat": 16,
                "userID": 0
            },
            {
                "id": 18,
                "name": "Seat #18",
                "seat": 18,
                "userID": 0
            },
            {
                "id": 19,
                "name": "Seat #19",
                "seat": 19,
                "userID": 0
            },
            {
                "id": 20,
                "name": "Seat #20",
                "seat": 20,
                "userID": 0
            }
        ],
        "booked": [
            {
                "id": 3,
                "name": "Seat #3",
                "seat": 3,
                "userID": 1
            },
            {
                "id": 9,
                "name": "Seat #9",
                "seat": 9,
                "userID": 111
            },
            {
                "id": 12,
                "name": "Seat #12",
                "seat": 12,
                "userID": 81
            },
            {
                "id": 15,
                "name": "Seat #15",
                "seat": 15,
                "userID": 39
            },
            {
                "id": 17,
                "name": "Seat #17",
                "seat": 17,
                "userID": 39
            }
        ]
    }
]