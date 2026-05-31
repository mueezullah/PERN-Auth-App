const router = require('express').Router();
const { create, listActive, getOne, update } = require('./campaign.controller');
const { validateCreate, validateUpdate } = require('./campaign.validation');
const { ensureAuthenticated } = require('../auth/auth.middleware');
const { deleteCampaign } = require('./campaign.controller');

router.post('/', ensureAuthenticated, validateCreate, create);
router.get('/', listActive);
router.get('/:id', getOne);
router.put('/:id', ensureAuthenticated, validateUpdate, update);
router.delete("/:id", ensureAuthenticated, deleteCampaign);

module.exports = router;
