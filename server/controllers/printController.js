const axios = require('axios');
const PDFDocument = require('pdfkit');
const Memory = require('../models/Memory');
const Scrapbook = require('../models/Scrapbook');
const upload = require('../config/multer');
// const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const tmp = require('tmp')

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

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

const generatePDF = async (scrapbook, memories, dedicationNote, bookSize) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageSizes ={
                small: [425.2, 595.3],
                standard:  [432, 648],
                premium: [612, 792]
            };
            const doc = new PDFDocument({
                size: pageSizes[bookSize] || [612, 792],
                margin:50
            });
            const tmpFile = tmp.fileSync({ postfix: '.pdf'});
            const writeStream = fs.createWriteStream(tmpFile.name);
            doc.pipe(writeStream)

            // const buffers = [];

//             doc.on('data', (chunk) => buffers.push(chunk));
//             doc.on('end', async () => {
//                 const pdfBuffer = Buffer.concat(buffers);

               
//                const uploadResult = await new Promise((res, rej) => {
//     cloudinary.uploader.upload_stream(
//         { 
//             resource_type: 'raw', 
//             folder: 'echoes-books',
//             public_id: `book${Date.now()}.pdf`,
//             overwrite: true,
//             format:"pdf"
//         },
//         (error, result) => {
//             if (error) rej(error);
//             else{
//             res(result);
//             } 
//         }
//     ).end(pdfBuffer);
// });
// resolve(uploadResult.secure_url);
//             });
            
          
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
              // Add blank pages to meet minimum 24 page requirement
              const currentPageCount = memories.filter(m => m.image).length + 2; // +2 for title and dedication pages
              const minPages = 24;
              if (currentPageCount < minPages) {
                const pagesToAdd = minPages - currentPageCount;
                for (let i = 0; i < pagesToAdd; i++) {
                    doc.addPage();
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
        const pdfPath = await generatePDF(scrapbook, memories, dedicationNote, bookSize);
        const pdfFileName = path.basename(pdfPath);
        const pdfUrl = `https://echoes-j0mn.onrender.com/temp${pdfFileName}`;
        console.log('PDF generated:', pdfUrl);

        console.log('Generating cover PDF...');
        const coverPath  = await generateCoverPDF(scrapbook, coverStyle, customCoverUrl, bookSize);
        const coverFileName = path.basename(coverPath);
        const coverPdfUrl = `https://echoes-j0mn.onrender.com/temp${coverFileName}`;
        console.log('Cover PDF generated:', coverPdfUrl);

        const token = await getLuluToken();

        const podPackageIds = {
            small: '0583X0827FCPRECW080CW444MXX',
            standard: '0600X0900FCPRELW080CW444GNG',
            premium: '0850X1100FCPRELW080CW444GNG'
        };

        const coverUrl = customCoverUrl || scrapbook.coverImage || 'https://via.placeholder.com/800x600';

        const printJob = await axios.post(
    'https://api.lulu.com/print-jobs/',
    {
        line_items: [
            {
                title: scrapbook.title,
                cover: coverPdfUrl,
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

const interiorPublicId = `echoes-books/${pdfUrl.split('/').slice(-1)[0]}`;
const coverPublicId = `echoes-books/${coverPdfUrl.split('/').slice(-1)[0]}`;

res.status(200).json({
    message: 'Print order created successfully!',
    orderId: printJob.data.id,
    estimatedDelivery: '7-14 business days'
});


setTimeout(async () => {
    try {
        // await cloudinary.uploader.destroy(interiorPublicId, { resource_type: 'raw' });
        // await cloudinary.uploader.destroy(coverPublicId, { resource_type: 'raw' });
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(coverPath);
        console.log('Temps PDF deleted');
    } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
    }
}, 10 * 60 * 1000);

    } catch (error) {
        console.error('Print order error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        res.status(500).json({ message: error.response?.data?.detail || error.message });
    }
};

const generateCoverPDF = async (scrapbook, coverStyle, customCoverUrl, bookSize) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pageSizes = {
                small: [425.2, 595.3],
                standard: [432, 648],
                premium: [612, 792]
            };

            const doc = new PDFDocument({
                size: pageSizes[bookSize] || [612, 792],
                margin: 0
            });
             const tmpFile = tmp.fileSync({ postfix: '.pdf'});
            const writeStream = fs.createWriteStream(tmpFile.name);
            doc.pipe(writeStream)

            // const buffers = [];
            // doc.on('data', (chunk) => buffers.push(chunk));
            // doc.on('end', async () => {
            //     const pdfBuffer = Buffer.concat(buffers);

            //     const uploadResult = await new Promise((res, rej) => {
            //         cloudinary.uploader.upload_stream(
            //             {
            //                 resource_type: 'raw',
            //                 folder: 'echoes-books',
            //                 public_id: `cover_${Date.now()}.pdf`,
            //                 overwrite: true,
            //                 format: 'pdf'
            //             },
            //             (error, result) => {
            //                 if (error) rej(error);
            //                 else {
            //                     console.log('Cover PDF URL:', result.secure_url);
            //                     res(result);
            //                 }
            //             }
            //         ).end(pdfBuffer);
            //     });

            //     resolve(uploadResult.secure_url);
            // });

            // If custom cover image exists use it
            if (customCoverUrl) {
                try {
                    const imageResponse = await axios.get(customCoverUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageResponse.data);
                    const pageSize = pageSizes[bookSize] || [612, 792];
                    doc.image(imageBuffer, 0, 0, { width: pageSize[0], height: pageSize[1] });
                } catch (imgError) {
                    console.error('Cover image error:', imgError.message);
                    // Fallback to styled cover
                    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#232020');
                    doc.fontSize(36).font('Helvetica-Bold').fillColor('#fff2d7')
                       .text(scrapbook.title, 50, doc.page.height / 2 - 50, { align: 'center' });
                }
            } else {
                // Style based on cover style
                const colors = {
                    classic: '#232020',
                    modern: '#72011f',
                    minimal: '#FDF6EC'
                };
                const textColors = {
                    classic: '#fff2d7',
                    modern: '#fff2d7',
                    minimal: '#3D2B1F'
                };

                doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors[coverStyle] || '#232020');
                doc.fontSize(36).font('Helvetica-Bold').fillColor(textColors[coverStyle] || '#fff2d7')
                   .text(scrapbook.title, 50, doc.page.height / 2 - 50, { align: 'center' });
                doc.fontSize(14).font('Helvetica').fillColor(textColors[coverStyle] || '#fff2d7')
                   .text('Made with Echoes', 50, doc.page.height / 2 + 20, { align: 'center' });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { createPrintOrder };