const User = require('../models/User');
const Scrapbook = require('../models/Scrapbook');


const createScrapbook = async (req, res) => {
    try {
        const { title, description, coverImage, isPrivate } = req.body;

        const scrapbook = await Scrapbook.create({
            title,
            description,
            coverImage,
            isPrivate,
            owner: req.user._id,
            members: [req.user._id]
        });

        res.status(201).json(scrapbook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getScrapbooks = async (req, res) => {
    try {
        const scrapbooks = await Scrapbook.find({ members: req.user._id });
        res.status(200).json(scrapbooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getScrapbook = async (req, res) => {
    try {
        const scrapbook = await Scrapbook.findById(req.params.id);

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        res.status(200).json(scrapbook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateScrapbook = async (req, res) => {
    try {
        const scrapbook = await Scrapbook.findById(req.params.id);

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        if (scrapbook.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updated = await Scrapbook.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteScrapbook = async (req, res) => {
    try {
        const scrapbook = await Scrapbook.findById(req.params.id);

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        if (scrapbook.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await scrapbook.deleteOne();
        res.status(200).json({ message: 'Scrapbook deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const inviteMember = async (req, res) => {
    try {
        const scrapbook = await Scrapbook.findById(req.params.id);

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        if (scrapbook.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { email } = req.body;

        const invitedUser = await User.findOne({ email });
        if (!invitedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (scrapbook.members.includes(invitedUser._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        scrapbook.members.push(invitedUser._id);
        await scrapbook.save();

        res.status(200).json({ message: 'Member invited successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { createScrapbook, getScrapbooks, getScrapbook, updateScrapbook, deleteScrapbook, inviteMember };