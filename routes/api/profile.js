const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const protect = passport.authenticate('jwt', { session: false });

//Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//Load Profile model
const Profile = require('../../models/Profile');

//Load User model
const User = require('../../models/User')


//@route  Get api/profile/test
//@desc Tests profile route
//@access Public
router.get('/test', (req, res) => {
  res.json({ msg: "Profile works" })
});

//@route  Get api/profile
//@desc Current User profile route
//@access Private
router.get('/', protect, (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user'
        return res.status(404).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err))
});

//@route  Get api/profile/handle/:handle
//@desc User profile route
//@access Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json(err))
});

//@route  Get api/profile/user/:user_id
//@desc User profile route
//@access Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }))
});

//@route  Get api/profile/all/
//@desc All User profile route
//@access Private
router.get('/all', (req, res) => {

  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles'
        return res.status(404).json(errors)
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }))
});


//@route  Post api/profile
//@desc Create or Edit User profile route
//@access Private
router.post('/', protect, (req, res) => {

  const { errors, isValid } = validateProfileInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  //Get fields
  const profileFields = {};

  profileFields.user = req.user.id;
  if (req.body.handle)
    profileFields.handle = req.body.handle;
  if (req.body.company)
    profileFields.company = req.body.company;
  if (req.body.website)
    profileFields.website = req.body.website;
  if (req.body.location)
    profileFields.location = req.body.location;
  if (req.body.bio)
    profileFields.bio = req.body.bio;
  if (req.body.status)
    profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;

  //Skills
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  //Socials 
  profileFields.social = {};
  if (req.body.youtube)
    profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter)
    profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook)
    profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin)
    profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram)
    profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      // Create

      // Check if handle exists
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = 'That handle already exists';
          res.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

//@route  Post api/profile/education
//@desc Add Education to User profile route
//@access Private
router.post('/education', protect, (req, res) => {

  const { errors, isValid } = validateEducationInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      //Add to experience array
      profile.education.unshift(newEdu);
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => res.status(400).json({ Message: 'Error saving education' }))
    })
});

//@route  Post api/profile/experience
//@desc Add Experience to User profile route
//@access Private
router.post('/experience', protect, (req, res) => {

  const { errors, isValid } = validateExperienceInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExperience = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      //Add to experience array
      profile.experience.unshift(newExperience);
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => res.status(400).json({ Message: 'Error saving work experience' }))
    })
});

//@route  Delete api/profile/experience/:exp_id
//@desc Delete Experience in User profile route
//@access Private
router.delete('/experience/:exp_id', protect, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //Splice out of array
      profile.experience.splice(removeIndex, 1);

      //Save
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => res.status(404).json(err))
    })
    .catch(err => res.status(404).json({ Msg: 'Error getting user profile' }))
});

//@route  Delete api/profile/education/:edu_id
//@desc Delete Education in User profile route
//@access Private
router.delete('/education/:edu_id', protect, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //Splice out of array
      profile.education.splice(removeIndex, 1);

      //Save
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => res.status(404).json(err))
    })
    .catch(err => res.status(404).json({ Msg: 'Error getting user profile' }))
});

//@route  Delete api/profile
//@desc Delete User & profile route
//@access Private
router.delete('/', protect, (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ Success: true }))
    })
    .catch(err => res.status(404).json({ Msg: 'Error getting user profile' }))
});


module.exports = router;
