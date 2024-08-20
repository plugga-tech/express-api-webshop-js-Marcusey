
var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

/* GET all users */
router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection('users');
    const userList = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    res.json(userList);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Unable to retrieve users' });
  }
});

/* GET user by ID */
router.post('/', async (req, res) => {
  const { id: userId } = req.body;

  try {
    const user = await req.app.locals.db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'There is no such user' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


/* Create user */
router.post('/add', async (req, res) => {
  const user = req.body;

  try {
    const result = await req.app.locals.db.collection('users').insertOne(user);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not create new user' });
  }
});

/* Login user */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await req.app.locals.db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Could not find that user! Please try another email.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong password! Please try again!' });
    }
    return res.status(200).json({ success: true, message: 'Login success! Welcome back!' });
  } catch (error) {
    console.error('Login error:', error);
    return handleServerError(res);
  }
});

function handleServerError(res) {
  return res.status(500).json({ error: 'Something happend at our server. Try again later.' });
}


module.exports = router;
