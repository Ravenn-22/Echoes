const Memory = require('../models/Memory');
const Scrapbook = require('../models/Scrapbook');
const User = require('../models/User');
const { getIO } = require('../config/socket');
const { sendNewMemoryEmail } = require('../config/email');



const createMemory = async (req, res) => {
    try {
        const { title, description, image, date, scrapbook } = req.body;

        const memory = await Memory.create({
            title,
            description,
            image,
            date,
            scrapbook,
            createdBy: req.user._id
        });

        const populatedMemory = await Memory.findById(memory._id).populate('createdBy', 'username');

        try {
            const io = getIO();
            io.to(scrapbook).emit('newMemory', populatedMemory);

            const scrapbookData = await Scrapbook.findById(scrapbook).populate('members', 'email username');
            const otherMembers = scrapbookData.members.filter(
                (member) => member._id.toString() !== req.user._id.toString()
            );
            for (const member of otherMembers) {
                await sendNewMemoryEmail(
                    member.email,
                    populatedMemory.createdBy.username,
                    title,
                    scrapbookData.title
                );
            }
        } catch (emailError) {
            console.error('Email notification Error:', emailError);
        }

        res.status(201).json(populatedMemory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMemories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const total = await Memory.countDocuments({ scrapbook: req.query.scrapbookId });

        const memories = await Memory.find({ scrapbook: req.query.scrapbookId })
            .populate('createdBy', 'username')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            memories,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.status(200).json(memory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        if (memory.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updated = await Memory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        if (memory.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await memory.deleteOne();
        res.status(200).json({ message: 'Memory deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const pinMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        memory.pinned = !memory.pinned;
        await memory.save();

        res.status(200).json(memory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createMemory, getMemories, getMemory, updateMemory, deleteMemory , pinMemory };