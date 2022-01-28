const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')
const Comment = require("../models/Comment"

)
//var comments = [];
var buffer = null;
// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Story.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate("user")
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user._id != req.user.id && story.status == 'private') {
      res.render('error/404')
    } else {
      res.render('stories/show', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc add Comment
// @route POST /stories/:id

router.post("/:id", ensureAuth, async(req,res) =>{
  try{
    let com = new Comment();
    com.body = req.body.comment;
    com.story = req.params.id;
    com.user = req.session.passport.user;
    //comments.push(com);

    //console.log(com);
    Comment.create(com);

    let story = await Story.findById(req.params.id).populate('user').lean()
    let komentar = await Comment.find({story:req.params.id}).populate("user").lean();
    
    console.log(komentar);
    res.render("stories/show",{story,komentar,})
    
  }catch(err){
    console.log(err);
    res.render("error/404");
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  
  try {
    buffer = await Story.findOne({
      _id: req.params.id,
    }).lean()

    if (!buffer) {
      return res.render('error/404')
    }

  
      res.render('stories/edit', {
        buffer,
      })
   
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(buffer._id).lean();
    if (!story) {
      return res.render('error/404')
    }else {
      story = await Story.findByIdAndUpdate({ _id: buffer._id }, req.body)
      res.redirect('/stories')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()
    if (!story) {
      return res.render('error/404')
    }
 else {
  await Story.remove({ _id: req.params.id })
  res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router