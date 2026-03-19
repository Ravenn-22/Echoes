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

const generatePDFWithShift = async (html, filename) => {
    const response = await axios.post(
        'https://api.pdfshift.io/v3/convert/pdf',
        {
            source: html,
            format: 'A4',
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
        },
        {
            auth: {
                username: 'api',
                password: process.env.PDFSHIFT_API_KEY
            },
            responseType: 'arraybuffer'
        }
    );
    return Buffer.from(response.data);
};

const generateInteriorHTML = (scrapbook, memories, dedicationNote) => {
    const memoriesHTML = memories.map((memory) => `
        <div class="memory-page">
            <h2>${memory.title}</h2>
            ${memory.image ? `<img src="${memory.image}" alt="${memory.title}" />` : ''}
            ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
            <p class="meta">By ${memory.createdBy?.username} • ${new Date(memory.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="page-break"></div>
    `).join('');

    // Add blank pages to meet 24 page minimum
    const memoryCount = memories.length;
    const totalPages = memoryCount + 2;
    let blankPages = '';
    if (totalPages < 24) {
        for (let i = 0; i < 24 - totalPages; i++) {
            blankPages += '<div class="page-break"></div>';
        }
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Georgia, serif;
                    margin: 0;
                    padding: 0;
                    color: #3D2B1F;
                }
                .title-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                }
                .title-page h1 {
                    font-size: 48px;
                    color: #72011f;
                    margin-bottom: 20px;
                }
                .dedication {
                    font-size: 18px;
                    font-style: italic;
                    color: #8B6F61;
                    max-width: 400px;
                }
                .page-break {
                    page-break-after: always;
                }
                .memory-page {
                    text-align: center;
                    padding: 20px;
                }
                .memory-page h2 {
                    font-size: 28px;
                    color: #72011f;
                    margin-bottom: 20px;
                }
                .memory-page img {
                    max-width: 80%;
                    max-height: 400px;
                    object-fit: contain;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .description {
                    font-size: 16px;
                    color: #3D2B1F;
                    margin-bottom: 10px;
                }
                .meta {
                    font-size: 12px;
                    color: #8B6F61;
                    font-style: italic;
                }
                .echoes-brand {
                    font-size: 12px;
                    color: #8B6F61;
                    text-align: center;
                    margin-top: 40px;
                }
            </style>
        </head>
        <body>
            <div class="title-page">
                <h1>${scrapbook.title}</h1>
                ${dedicationNote ? `<p class="dedication">${dedicationNote}</p>` : ''}
                <p class="echoes-brand">Made with Echoes 🌸</p>
            </div>
            <div class="page-break"></div>
            ${memoriesHTML}
            ${blankPages}
        </body>
        </html>
    `;
};

const generateCoverHTML = (scrapbook, coverStyle, customCoverUrl) => {
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

    const bgColor = colors[coverStyle] || '#232020';
    const textColor = textColors[coverStyle] || '#fff2d7';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: ${customCoverUrl ? 'transparent' : bgColor};
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-family: Georgia, serif;
                }
                ${customCoverUrl ? `
                .cover-bg {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-image: url('${customCoverUrl}');
                    background-size: cover;
                    background-position: center;
                    z-index: -1;
                }
                ` : ''}
                h1 {
                    font-size: 48px;
                    color: ${textColor};
                    margin-bottom: 20px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                }
                .brand {
                    font-size: 14px;
                    color: ${textColor};
                    opacity: 0.7;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            ${customCoverUrl ? '<div class="cover-bg"></div>' : ''}
            <h1>${scrapbook.title}</h1>
            <p class="brand">Made with Echoes 🌸</p>
        </body>
        </html>
    `;
};

const createPrintOrder = async (req, res) => {
    console.log('Print Order started');
    console.log('Request body:', req.body);
    try {
        const { scrapbookId, dedicationNote, coverStyle, bookSize, shippingAddress, customCoverUrl } = req.body;

        const scrapbook = await Scrapbook.findById(scrapbookId);
        const memories = await Memory.find({ scrapbook: scrapbookId }).populate('createdBy', 'username');

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        console.log('Generating interior PDF...');
        const interiorHTML = generateInteriorHTML(scrapbook, memories, dedicationNote);
        const interiorBuffer = await generatePDFWithShift(interiorHTML);
        console.log('Interior PDF generated');

        console.log('Generating cover PDF...');
        const coverHTML = generateCoverHTML(scrapbook, coverStyle, customCoverUrl);
        const coverBuffer = await generatePDFWithShift(coverHTML);
        console.log('Cover PDF generated');

        // Store buffers in memory temporarily
        const pdfId = `pdf_${Date.now()}`;
        const coverId = `cover_${Date.now()}`;
        global.tempPDFs = global.tempPDFs || {};
        global.tempPDFs[pdfId] = interiorBuffer;
        global.tempPDFs[coverId] = coverBuffer;

        const pdfUrl = `https://echoes-j0mn.onrender.com/temp/${pdfId}`;
        const coverPdfUrl = `https://echoes-j0mn.onrender.com/temp/${coverId}`;

        console.log('Getting Lulu token...');
        const token = await getLuluToken();

        const podPackageIds = {
            small: '0583X0827FCPRECW080CW444MXX',
            standard: '0600X0900FCPRELW080CW444GNG',
            premium: '0850X1100FCPRELW080CW444GNG'
        };

        console.log('Creating Lulu print job...');
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

        console.log('Print job created:', printJob.data.id);

        res.status(200).json({
            message: 'Print order created successfully!',
            orderId: printJob.data.id,
            estimatedDelivery: '7-14 business days'
        });

        // Delete temp PDFs after 10 minutes
        setTimeout(() => {
            delete global.tempPDFs[pdfId];
            delete global.tempPDFs[coverId];
            console.log('Temp PDFs deleted from memory');
        }, 10 * 60 * 1000);

    } catch (error) {
        const errorData = error.response?.data;
        if(Buffer.isBuffer(errorData)){
            console.error ("PdfShift error:", Buffer.from(errorData).toString('utf-8'));

        }else{

            console.error('Print order error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        }
        res.status(500).json({ message: error.response?.data?.detail || error.message });
    }
};

module.exports = { createPrintOrder };