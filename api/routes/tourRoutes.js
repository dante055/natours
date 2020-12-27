const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// ----------  Greate review on a tour (nested routing) ----------------------

router.get(
  '/top-5-cheap',
  tourController.aliasTopFive,
  tourController.getAllTours
);

router.get(
  '/created-by-me',
  tourController.createdByCurrentUser,
  tourController.getAllTours
);

router.get('/tour-stats', tourController.getTourStats);

router.get('/monthly-plan', tourController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .post(tourController.addTourCreator, tourController.createTour)
  .get(tourController.getAllTours);

router
  .route('/:tourId')
  .get(tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(tourController.deleteTour);

module.exports = router;
