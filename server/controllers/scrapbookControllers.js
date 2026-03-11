const User = require('../models/User');
const Scrapbook = require('../models/Scrapbook');
const { sendInviteEmail } = require('../config/email')


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
        const scrapbooks = await Scrapbook.find({ members: req.user._id })
            .populate('owner', 'username')
            .populate('members', 'username');

        const scrapbooksWithCount = await Promise.all(
            scrapbooks.map(async (scrapbook) => {
                const memoryCount = await Memory.countDocuments({ scrapbook: scrapbook._id });
                return { ...scrapbook.toObject(), memoryCount };
            })
        );

        res.status(200).json(scrapbooksWithCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getScrapbook = async (req, res) => {
   try {
        const scrapbook = await Scrapbook.findById(req.params.id)
            .populate('owner', 'username')
            .populate('members', 'username');

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
        const scrapbook = await Scrapbook.findById(req.params.id).populate('owner', 'username');

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        const userToInvite = await User.findOne({ email: req.body.email.toLowerCase() });

        if (!userToInvite) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (scrapbook.members.includes(userToInvite._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        scrapbook.members.push(userToInvite._id);
        await scrapbook.save();

        try {
            console.log('Sending invite email to:', userToInvite.email)
            await sendInviteEmail(userToInvite.email, scrapbook.owner.username, scrapbook.title);
            console.log('Invite email sent successfully')
        } catch (emailError) {
            console.error('Invite email error:', emailError);
        }

        res.status(200).json({ message: 'Member invited successfully' });
    } catch (error) {
        console.error('Invite member error:', error);
        res.status(500).json({ message: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const scrapbook = await Scrapbook.findById(req.params.id);

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        if (scrapbook.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the owner can remove members' });
        }

        scrapbook.members = scrapbook.members.filter(
            (member) => member.toString() !== req.params.memberId
        );

        await scrapbook.save();

        res.status(200).json(scrapbook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createScrapbook, getScrapbooks, getScrapbook, updateScrapbook, deleteScrapbook, inviteMember, removeMember };