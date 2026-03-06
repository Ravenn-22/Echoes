const express = require ('express');
const router = express.Router()
const{createMemory, getMemories, getMemory , updateMemory, deleteMemory} = require('../controllers/memoryController')
const { protect } = require('../middleware/authMiddleware');


router.post('/',protect, createMemory);
router.get('/',protect, getMemories);
router.get('/:id',protect, getMemory);
router.put('/:id', protect, updateMemory);
router.delete('/:id',protect, deleteMemory);


module.exports = router;