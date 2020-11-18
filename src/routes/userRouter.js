const express = require('express');
const User = require('../models/user.model');
const router = express.Router();

//create user
router.post('/add', async (req, res) => 
{
    let {name, email, username, password, description} = req.body;

    User.create({
        
    })
})
