const axios = require('axios');
const PDFDocument = require('pdfkit');
const Memory = require('../models/Memory');
const Scrapbook = require('../models/Scrapbook');
const upload = require('../config/multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

const generatePDF = async (scrapbook, memories, dedicationNote) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(buffers);

               
               const uploadResult = await new Promise((res, rej) => {
    cloudinary.uploader.upload_stream(
        { 
            resource_type: 'raw', 
            folder: 'echoes-books',
            public_id: `book_${Date.now()}`,
            overwrite: true
        },
        (error, result) => {
            if (error) rej(error);
            else res(result);
        }
    ).end(pdfBuffer);
});

resolve(uploadResult.secure_url);
            });
            console.log('PDF URL:', uploadResult.secure_url);
console.log('Public ID:', uploadResult.public_id);

          
            doc.fontSize(36)
               .font('Helvetica-Bold')
               .text(scrapbook.title, { align: 'center' });

            doc.moveDown();

            
            if (dedicationNote) {
                doc.fontSize(14)
                   .font('Helvetica-Oblique')
                   .text(dedicationNote, { align: 'center' });
            }

            doc.addPage();

           
            for (const memory of memories) {
                if (memory.image) {
                    try {
                        const imageResponse = await axios.get(memory.image, { responseType: 'arraybuffer' });
                        const imageBuffer = Buffer.from(imageResponse.data);

                        doc.fontSize(18)
                           .font('Helvetica-Bold')
                           .text(memory.title, { align: 'center' });

                        doc.moveDown(0.5);

                        doc.image(imageBuffer, {
                            fit: [400, 400],
                            align: 'center'
                        });

                        doc.moveDown();

                        if (memory.description) {
                            doc.fontSize(12)
                               .font('Helvetica')
                               .text(memory.description, { align: 'center' });
                        }

                        doc.fontSize(10)
                           .font('Helvetica-Oblique')
                           .text(`By ${memory.createdBy?.username} • ${new Date(memory.createdAt).toLocaleDateString()}`, { align: 'center' });

                        doc.addPage();
                    } catch (imgError) {
                        console.error('Image error:', imgError.message);
                    }
                }
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const createPrintOrder = async (req, res) => {
    try {
        const { scrapbookId, dedicationNote, coverStyle, bookSize, shippingAddress, customCoverUrl } = req.body;

        const scrapbook = await Scrapbook.findById(scrapbookId);
        const memories = await Memory.find({ scrapbook: scrapbookId }).populate('createdBy', 'username');

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        console.log('Generating PDF...');
        const pdfUrl = await generatePDF(scrapbook, memories, dedicationNote);
        console.log('PDF generated:', pdfUrl);

        const token = await getLuluToken();

        const podPackageIds = {
            small: '0600X0900BWSTDSS060UW444MXX',
            standard: '0850X1100FCSTDPB060UW444MXX',
            premium: '0850X1100FCPREM060UW444MXX'
        };

        const coverUrl = customCoverUrl || scrapbook.coverImage || 'https://via.placeholder.com/800x600';

        const printJob = await axios.post(
    'https://api.lulu.com/print-jobs/',
    {
        line_items: [
            {
                title: scrapbook.title,
                cover: coverUrl,
                interior: {
                    source_url: pdfUrl
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


try {
    const publicId = `echoes-books/${pdfUrl.split('/').slice(-1)[0].replace('.pdf', '')}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('PDF deleted from Cloudinary');
} catch (cleanupError) {
    console.error('Cleanup error:', cleanupError.message);
}

res.status(200).json({
    message: 'Print order created successfully!',
    orderId: printJob.data.id,
    estimatedDelivery: '7-14 business days'
});

    } catch (error) {
        console.error('Print order error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        res.status(500).json({ message: error.response?.data?.detail || error.message });
    }
};

module.exports = { createPrintOrder };