const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const protect = passport.authenticate('jwt', {session: false});

//Post model
const Post = require('../../models/Post');
//Post model
const Profile = require('../../models/Profile');

//Post validator
const validatePostInput = require('../../validation/post');

//@route  Get api/posts/test
//@desc Tests post route
//@access Public
router.get('/test', (req, res) => {
  res.json({msg: "Posts works"})
});


//@route  Post api/posts
//@desc Create post route
//@access Private
router.post('/', protect, (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  //Check valdation
  if (!isValid){
    return res.status(400).json(errors)
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.name,
    user: req.user.id
  });
  newPost.save()
  .then(post => res.json(post))
  .catch(err => res.json(err))
})

//@route  Get api/posts
//@desc Get All post route
//@access Public
router.get('/', (req, res) => {
  Post.find()
  .sort({date: -1})
  .then(posts => res.json(posts))
  .catch(err => res.status(404).json({noposts: 'No posts found'}))
});

//@route  Get api/posts/:id
//@desc Get post by id route
//@access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({nopostfound: 'No post found with that id'}))
});

//@route  Delete api/posts/:id
//@desc Delete post by id route
//@access Private
router.delete('/:id', protect, (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then(post => {
      //Check for post owner
      if(post.user.toString() !== req.user.id){
        return res.status(401).json({ notauthorized: 'User not authorized'})
      }

      post.remove()
      .then(() => res.json({success: true}))
    })
    .catch(err => res.status(404).json({postnotfound: 'No post found'}));
  })
})


module.exports = router;
