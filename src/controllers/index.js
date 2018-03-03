// ========== Global Dependencies ============ //
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const homeFunctions = require('./homeFunctions');
const userFunctions = require('./userFunctions');
const postFunctions = require('./postFunctions');

// Home Routes
router.get('/', homeFunctions.homeMessage);

// User Routes
router.get('/users', userFunctions.getAllUsers);

// Post Routes
router.get('/posts', postFunctions.getAllPosts);

router.post('/posts', upload.single('posts'), postFunctions.uploadPosts);


module.exports = router;