const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then((favorite) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorite)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        req.body.forEach((campsite) => {
          console.log(campsite)
          if (!favorite.campsites.includes(campsite._id)) {
            favorite.campsites.push(campsite)
            favorite.save()
          }
        })
        res.json(favorite)
      } else {
        let newFavorite = { user: req.user._id, campsites: req.body }
        Favorite.create(newFavorite)
          .then((favorite) => {
            favorite.save()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
          })
          .catch((err) => next(err))
      }
    })
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /favorites`)
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((response) => {
        if (response) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(response)
        } else {
          res.setHeader('Content-Type', 'text/plain')
          res.end('You do not have any favorites to delete')
        }
      })
      .catch((err) => next(err))
  })

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    )
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId)
          res.json(favorite)
        } else {
          res.send('That campsite is already in the list of favorites!')
        }
      } else {
        let newFavorite = {
          user: req.user._id,
          campsites: [req.params.campsiteId],
        }
        Favorite.create(newFavorite)
          .then((favorite) => {
            favorite.save()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
          })
          .catch((err) => next(err))
      }
    })
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    )
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        favorite.campsites.filter(
          (campsite) => campsite._id !== req.params.campsiteId
        )
        favorite.save()
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorite)
      } else {
        res.setHeader('Content-Type', 'text/plain')
        res.end('You do not have any favorites to delete')
      }
    })
  })

module.exports = favoriteRouter
