const express = require('express');
const router = express.Router();
const {createScrapbook, getScrapbooks, getScrapbook , updateScrapbook, deleteScrapbook, inviteMember, removeMember} = require('../controllers/scrapbookControllers')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, createScrapbook);
router.get('/',protect, getScrapbooks);
router.get('/:id',protect, getScrapbook);
router.put('/:id',protect, updateScrapbook);
router.delete('/:id',protect, deleteScrapbook);
router.post('/:id/invite', protect, inviteMember);
router.delete('/:id/members/:memberId', protect, removeMember);

module.exports = router;