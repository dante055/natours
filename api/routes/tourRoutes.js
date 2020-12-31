const express = require('express');
const tourController = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// ----------  Greate review on a tour (nested routing) ----------------------

router.get(
  '/top-5-cheap',
  tourController.aliasTopFive,
  tourController.getAllTours
);

router.get('/tour-stats', tourController.getTourStats);

router.get(
  '/monthly-plan',
  protect,
  restrictTo('admin', 'lead-guide'),
  tourController.getMonthlyPlan
);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.addTourCreator,
    tourController.createTour
  )
  .get(tourController.getAllTours);

router
  .route('/:tourId')
  .get(tourController.getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
