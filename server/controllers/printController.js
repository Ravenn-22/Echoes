const axios = require('axios');
const Memory = require('../models/Memory');
const Scrapbook = require('../models/Scrapbook');

const getLuluToken = async () => {
    const response = await axios.post(
        'https://api.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
        new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.LULU_CLIENT_ID,
            client_secret: process.env.LULU_CLIENT_SECRET
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    return response.data.access_token;
};

const createPrintOrder = async (req, res) => {
    try {
        const { scrapbookId, dedicationNote, coverStyle, bookSize, shippingAddress, customCoverUrl } = req.body;

        
        const scrapbook = await Scrapbook.findById(scrapbookId);
        const memories = await Memory.find({ scrapbook: scrapbookId }).populate('createdBy', 'username');

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        
        const token = await getLuluToken();

      
        const podPackageIds = {
            small: '0600X0900BWSTDSS060UW444MXX',
            standard: '0850X1100FCSTDPB060UW444MXX',
            premium: '0850X1100FCPREM060UW444MXX'
        };

        
        const pages = memories.map((memory) => ({
            type: 'image',
            url: memory.image || 'https://via.placeholder.com/800x600'
        }));

   
        const printJob = await axios.post(
            'https://api.lulu.com/print-jobs/',
            {
                line_items: [
                    {
                        title: scrapbook.title,
                        cover: customCoverUrl || `https://via.placeholder.com/800x600?text=${encodeURIComponent(scrapbook.title)}`,
                        interior: {
                            source_url: pages[0]?.url || 'https://via.placeholder.com/800x600'
                        },
                        pod_package_id: podPackageIds[bookSize],
                        quantity: 1
                    }
                ],
                shipping_address: {
                    name: shippingAddress.fullName,
                    street1: shippingAddress.address,
                    city: shippingAddress.city,
                    state_code: shippingAddress.state,
                    country_code: shippingAddress.country,
                    postcode: shippingAddress.zipCode,
                    phone_number: shippingAddress.phone || '0000000000',
                    email: req.user.email
                },
                shipping_level: 'MAIL',
                contact_email: req.user.email
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json({
            message: 'Print order created successfully!',
            orderId: printJob.data.id,
            estimatedDelivery: '7-14 business days'
        });

    } catch (error) {
        console.error('Print order error:', error.response?.data || error.message);
        res.status(500).json({ message: error.response?.data?.detail || error.message });
    }
};

module.exports = { createPrintOrder };