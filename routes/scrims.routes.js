const { Router } = require('express');
const controllers = require('../controllers/scrims.controllers');
const auth = require('../middleware/auth');

const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.get('/scrims/today', controllers.getTodaysScrims); // GET
router.post('/scrims', controllers.createScrim); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put('/scrims/:id', controllers.updateScrim); // PUT

// PUT => Set all new attributes for an existing resource.
// PATCH => Partially update an existing resource (not all attributes required).
// patch because these routes add a subsidiary resource instead of completely replacing whatever is available.

router.patch('/scrims/:id/add-image', auth, controllers.addImageToScrim); // PATCH
router.patch('/scrims/:id/remove-image', controllers.removeImageFromScrim); // PATCH

router.patch(
  '/scrims/:scrimId/insert-player/:userId',
  auth,
  controllers.insertPlayerInScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/remove-player/:userId',
  auth,
  controllers.removePlayerFromScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/move-player/:userId',
  auth,
  controllers.movePlayerInScrim
); // PATCH

router.patch(
  '/scrims/:scrimId/insert-caster/:casterId',
  auth,
  controllers.insertCasterInScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/remove-caster/:casterId',
  auth,
  controllers.removeCasterFromScrim
); // PATCH

router.patch('/scrims/:id/set-winner', controllers.setScrimWinner); // PATCH

router.delete('/scrims/:id', controllers.deleteScrim); // DELETE

module.exports = router;
