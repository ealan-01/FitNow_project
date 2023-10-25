const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ extended: true }))

app.set('view engine', 'ejs')

const mongoose = require('mongoose')
mongoose.set('strictQuery', true);

//Connect to Mongo DB 
const connectionPath = 'mongodb://127.0.0.1/usersDB';
let db = mongoose.connect(connectionPath, { useNewUrlParser: true }, (err) => {

    if (err) {
        console.log("failed to conneect", err)
    } else {
        console.log('connected to db succcesfuly...')
    }
})
//import the user and session collections
const user_collection = require('./models/Users');
const { newSession, Authenticated } = require('./models/session');
newSession(app, connectionPath);


//LAMA PAGE
//main page route - when sending request for first time
app.get('/', (req, res) => {
    req.session.Authenticated = false; //false because the user has not logged in yet
    res.render('main', { isAuth: req.session.Authenticated });
});

//LAMA's PAGE
//main page route - when user is logged in
app.get('/main', Authenticated, (req, res) => {
    res.render('main', { isAuth: req.session.Authenticated });
});

//NOUF's PAGE
// login page route 
app.get('/login', (req, res) => {
    res.render('login', { login_error_message: '', signup_error_message: '' });
})

// login and sign in process - storing data in DB via POST
app.post('/login', (req, res) => {

    const formType = req.body.formType;
    if (formType === 'login') {

        console.log("login");

        // check if user exists
        user_collection.findOne({ email: req.body.email }, (error, user) => {

            // if user exists
            if (user) {
                // check the password match
                const password = req.body.password;
                const isMatch = user.password === password;

                // if password matches
                if (isMatch) {
                    console.log("correct password");
                    req.session.userEmail = req.body.email;  // <-- Store the email in the session here
                    req.session.Authenticated = true;
                    res.redirect(`/main`);
                }
                // if password did not match
                else {
                    console.log("incorrect password");
                    const message = 'incorrect password';
                    res.render('login', { login_error_message: message, signup_error_message: '' });
                }
            }
            // if user does not exist
            else {
                console.log('user not found');
                const message = 'user does not exist';
                res.render('login', { login_error_message: message, signup_error_message: '' });
            }

            if (error) {
                // if there is an error occurred while searching for the user
                console.error('Error finding user:', error);
            }
        });
    }
    /* ------------------- Signup ------------------- */
    if (formType === 'signup') {

        console.log("signup");

        // create a new user
        let newUser = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            weight: req.body.weight,
            height: req.body.height,
            calories: req.body.calories,
            gender: req.body.gender
        }

        // check if user exists
        user_collection.findOne({ email: req.body.email }, (error, user) => {

            // if user exists print error message
            if (user) {
                const message = 'email already exsists';
                res.render('login', { login_error_message: '', signup_error_message: message });
            }

            // if user is new, create a new user and add it to the database
            else {
                const user = new user_collection(newUser);
                user.save((error) => {

                    if (!error) {
                        console.log('user is added successfully to Database!');
                        res.render('login', { login_error_message: '', signup_error_message: '' });
                    } //end if

                    else {
                        console.log("error occured while saving the user", error);
                    } //end else

                }) //end save
            }

            // if there is an error occured while searching for the user
            if (error) {
                console.error('Error finding user:', error);
            } //end if
        }) //end findOne
    } //end sign in process
}); //end post

//profile route - BAYAN's PAGE
app.post('/profile', Authenticated, (req, res) => {
    console.log("Received data:", req.body);
    const updatedData = {
        firstname: req.body.inputFirstName,
        lastname: req.body.inputLastName,
        weight: req.body.inputweight,
        height: req.body.inputheight,
        email: req.body.inputEmailAddress,
        calories: req.body.inputCalories
    };

        // Update the user's data
        user_collection.findOneAndUpdate({email: req.session.userEmail}, updatedData, (error, result) => {
            if (error) {
                console.error('Error updating user data:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            console.log("Update result:", result); 
            res.redirect('/profile'); // Redirect back to the profile page
        });
        
});


app.get('/profile', Authenticated, (req, res) => {
    user_collection.findOne({ email: req.session.userEmail }, (error, user) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (!user) {
            console.warn('User not found:', req.session.userEmail);
            return res.status(404).send('User not found');
        }

        // Render the profile page with the user's data
        res.render('profilePage', {
            isAuth: req.session.Authenticated,
            user: user
        });
    });
});


//dashboard route - Ealan's PAGE
app.get('/dashboard', Authenticated, (req, res) => {
    user_collection.findOne({ email: req.session.userEmail }, (error, user) => {
        if (error) {
            console.error('Error fetching user data:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        // Render the dashboard with the user's data
        res.render('dashboard', {
            isAuth: req.session.Authenticated,
            weight: user.weight,
            height: user.height,
            calories: user.calories
        });
    });
});

app.get('/getUserData', Authenticated, (req, res) => {
    user_collection.findOne({ email: req.session.userEmail }, (error, user) => {
        if (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Send the user's data as JSON
        res.json({
            weight: user.weight,
            height: user.height,
            calories: user.calories
        });
    });
});

//log out route
app.get('/logout', Authenticated, (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy((err) => {
        if (err) {
            console.error("error logging out", err); //error logging out
        }
        else {
            res.redirect('/'); //succesful logout => redirect to the main page
        }
    });
});

app.listen(3000, () => {
    console.log('connected to port 3000')
})