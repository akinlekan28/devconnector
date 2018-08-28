const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const protect = passport.authenticate('jwt', { session: false });

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
  res.json({ msg: "Posts works" })
});


//@route  Post api/posts
//@desc Create post route
//@access Private
router.post('/', protect, (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  //Check valdation
  if (!isValid) {
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
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noposts: 'No posts found' }))
});

//@route  Get api/posts/:id
//@desc Get post by id route
//@access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: 'No post found with that id' }))
});

//@route  Delete api/posts/:id
//@desc Delete post by id route
//@access Private
router.delete('/:id', protect, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'User not authorized' })
          }

          post.remove()
            .then(() => res.json({ success: true }))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
})

//@route  Post api/posts/like/:id
//@desc Like post by id route
//@access Private
router.post('/like/:id', protect, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already liked this post' })
          }
          //Add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save()
            .then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ nopostfound: 'No post found' }))
    })
});

//@route  Post api/posts/like/:id
//@desc Unlike post by id route
//@access Private
router.post('/unlike/:id', protect, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() == req.user.id).length === 0) {
            return res.status(400).json({ noliked: 'You have not yet liked this post' })
          }
          //Get removed index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice out of array
          post.likes.splice(removeIndex, 1);
          post.save().then(post => {
            res.json(post)
          })
        })
        .catch(err => res.status(404).json({ nopostfound: 'No post found' }))
    })
});

//@route  Post api/posts/comment/:id
//@desc Add comment post by id route
//@access Private
router.post('/comment/:id', protect, (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  //Check valdation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        user: req.user.id
      };

      //Add to comment array
      post.comments.unshift(newComment);
      post.save()
        .then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
})

//@route  Delete api/posts/comment/:id
//@desc Delete comment post by id route
//@access Private
router.delete('/comment/:id/:comment_id', protect, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      //Check if comment exist
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentnotexist: 'Comment does not exist' });
      }
      //get remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      //splice from array
      post.comments.splice(removeIndex, 1);

      post.save()
        .then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ nopostfound: 'No post found' }))
});


module.exports = router;
