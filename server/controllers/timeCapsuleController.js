const TimeCapsule = require('../models/TimeCapsule');
const User = require('../models/User');
const { sendCapsuleUnlockEmail } = require('../config/email');

const createCapsule = async (req, res) => {
    try {
        const { title, message, images, scrapbook, unlockDate, type, memberEmails } = req.body;

        // Find members by email
        let members = [req.user._id];
        if (memberEmails && memberEmails.length > 0) {
            const foundUsers = await User.find({ email: { $in: memberEmails } });
            const memberIds = foundUsers.map(u => u._id);
            members = [...new Set([...members, ...memberIds])];
        }

        const capsule = await TimeCapsule.create({
            title,
            message,
            images: images || [],
            scrapbook: scrapbook || null,
            createdBy: req.user._id,
            unlockDate,
            type: type || 'capsule',
            members
        });

        res.status(201).json(capsule);
    } catch (error) {
        console.error('Create a capsule error', error.message)
        res.status(500).json({ message: error.message });
    }
};

const getCapsules = async (req, res) => {
    try {
        const capsules = await TimeCapsule.find({
            members: req.user._id
        })
        .populate('createdBy', 'username profilePicture')
        .sort({ unlockDate: 1 });

        // Hide contents of locked capsules
        const safeCapsules = capsules.map(capsule => {
            if (!capsule.isUnlocked && capsule.type === 'capsule') {
                return {
                    _id: capsule._id,
                    title: capsule.title,
                    unlockDate: capsule.unlockDate,
                    isUnlocked: capsule.isUnlocked,
                    type: capsule.type,
                    createdBy: capsule.createdBy,
                    createdAt: capsule.createdAt
                };
            }
            return capsule;
        });
        res.status(200).json(safeCapsules);
    } catch (error) {
       console.error('Create a capsule error', error.message)
        res.status(500).json({ message: error.message });
    }
};

const getCapsule = async (req, res) => {
    try {
        const capsule = await TimeCapsule.find( {members: req.user._id})
            .populate('createdBy', 'username profilePicture');
           

        if (!capsule) {
            return res.status(404).json({ message: 'Capsule not found' });
        }

        if (!capsule.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!capsule.isUnlocked && capsule.type === 'capsule') {
            return res.status(403).json({ 
                message: 'This capsule is still locked',
                unlockDate: capsule.unlockDate
            });
        }

        res.status(200).json(capsule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCapsule = async (req, res) => {
    try {
        const capsule = await TimeCapsule.findById(req.params.id);

        if (!capsule) {
            return res.status(404).json({ message: 'Capsule not found' });
        }

        if (capsule.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await capsule.deleteOne();
        res.status(200).json({ message: 'Capsule deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const checkAndUnlockCapsules = async () => {
    try {
        const capsulesToUnlock = await TimeCapsule.find({
            isUnlocked: false,
            unlockDate: { $lte: new Date() }
        }).populate('members', 'email username').populate('createdBy', 'username');

        for (const capsule of capsulesToUnlock) {
            capsule.isUnlocked = true;
            await capsule.save();

            // Send unlock email to all members
            for (const member of capsule.members) {
                try {
                    await sendCapsuleUnlockEmail(
                        member.email,
                        member.username,
                        capsule.title,
                        capsule.type,
                        capsule.message
                    );
                } catch (emailError) {
                    console.error('Capsule unlock email error:', emailError.message);
                }
            }

            console.log(`Capsule unlocked: ${capsule.title}`);
        }
    } catch (error) {
        console.error('Check capsules error:', error.message);
    }
};

module.exports = { createCapsule, getCapsules, getCapsule, deleteCapsule, checkAndUnlockCapsules };