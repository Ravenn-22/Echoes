const Memory = require('../models/Memory');
const Notification = require("../models/notification.js");
const Scrapbook = require ( "../models/Scrapbook.js");


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
        const scrapbooks = await Scrapbook.findById(req.body.scrapbook);

for (const member of scrapbooks.members) {

   
    if (member.toString() !== req.user._id.toString()) {

        await Notification.create({
            user: member,
            message: `${req.user.username} added a new memory`,
            scrapbook: scrapbooks._id
        });

    }
}


        res.status(201).json(memory);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMemories = async (req, res) => {
     try {
        const memories = await Memory.find({ scrapbook: req.query.scrapbookId })
            .populate('createdBy', 'username');
        res.status(200).json(memories);
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


const getNotifications = async (req, res) => {

    const notifications = await Notification
        .find({ user: req.user._id })
        .sort({ createdAt: -1 });

    res.json(notifications);
};


module.exports = { createMemory, getMemories, getMemory, updateMemory, deleteMemory };