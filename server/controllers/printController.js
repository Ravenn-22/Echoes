const axios = require('axios');
const Memory = require('../models/Memory');
const Scrapbook = require('../models/Scrapbook');
const Api2Pdf = require('api2pdf');
const { sendPrintConfirmationEmail } = require('../config/email');
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


const generatePDFWithAPI2PDF = async (html, bookSize) => {
    const a2pClient = new Api2Pdf(process.env.API2PDF_KEY);
    
    const pageSizes = {
        small: { width: '5.83in', height: '8.27in' },
        standard: { width: '6in', height: '9in' },
        premium: { width: '8.5in', height: '11in' }
    };

    const size = pageSizes[bookSize] || pageSizes.premium;

    const result = await a2pClient.chromeHtmlToPdf(html, {
        inlinePdf: false,
        fileName: `echoes_${Date.now()}.pdf`,
        options: {
            paperWidth: size.width,
            paperHeight: size.height
        }
    });
    return result.FileUrl;
};
const generateInteriorHTML = (scrapbook, memories, dedicationNote) => {
    const memoriesHTML = memories.map((memory) => `
        <div class="memory-page">
            <div class="polaroid">
                ${memory.image ? `<img src="${memory.image}" alt="${memory.title}" />` : '<div class="no-image">🌸</div>'}
                <div class="polaroid-caption">
                    <h2>${memory.title}</h2>
                    ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
                    <p class="meta">By ${memory.createdBy?.username} • ${new Date(memory.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
        <div class="page-break"></div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Georgia, serif;
                    background: #FDF6EC;
                    color: #3D2B1F;
                }
                .title-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                    background: #232020;
                    color: #fff2d7;
                    padding: 40px;
                }
                .title-page h1 {
                    font-size: 52px;
                    color: #C9627D;
                    margin-bottom: 25px;
                    letter-spacing: 3px;
                }.dedication {
                    font-size: 20px;
                    font-style: italic;
                    color: rgba(255,242,215,0.8);
                    max-width: 450px;
                    line-height: 1.8;
                }
                .echoes-brand {
                    font-size: 14px;
                    color: rgba(255,242,215,0.4);
                    margin-top: 50px;
                    letter-spacing: 2px;
                }
                .page-break {
                    page-break-after: always;
                }
                .memory-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #FDF6EC;
                    padding: 30px;
                }
                .polaroid {
                    background: white;
                    padding: 15px 15px 40px 15px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    max-width: 90%;
                    width: 500px;
                    text-align: center;
                }
                .polaroid img {
                    width: 100%;
                    height: 380px;
                    object-fit: cover;
                    display: block;
                }
                .no-image {
                    width: 100%;
                    height: 380px;
                    background: #f0e6d3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                }
                .polaroid-caption {
                    padding: 15px 10px 5px 10px;
                }
                    .polaroid-caption h2 {
                    font-size: 22px;
                    color: #3D2B1F;
                    margin-bottom: 8px;
                    font-family: Georgia, serif;
                }
                .description {
                    font-size: 14px;
                    color: #8B6F61;
                    margin-bottom: 8px;
                    line-height: 1.6;
                }
                .meta {
                    font-size: 12px;
                    color: #C9627D;
                    font-style: italic;
                }
                .closing-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                    background: #232020;
                    color: #fff2d7;
                    padding: 60px 40px;
                }
                .closing-page .echoes-logo {
                    font-size: 36px;
                    color: #C9627D;
                    letter-spacing: 5px;
                    margin-bottom: 30px;
                    font-family: Georgia, serif;
                }
                .closing-note {
                    font-size: 16px;
                    font-style: italic;
                    color: rgba(255,242,215,0.8);
                    max-width: 450px;
                    line-height: 2;
                    margin-bottom: 30px;
                }
                .closing-url {
                    font-size: 13px;
                    color: rgba(255,242,215,0.4);
                    letter-spacing: 2px;
                }
            </style>
        </head>
        <body>
           <div class="title-page">
                <h1>${scrapbook.title}</h1>
                ${dedicationNote ? `<p class="dedication">"${dedicationNote}"</p>` : ''}
                <p class="echoes-brand">ECHOES · echoesmemo.xyz</p>
            </div>
            <div class="page-break"></div>
            
            ${memoriesHTML}
            
            <div class="closing-page">
                <p class="echoes-logo">ECHOES</p>
                <p class="closing-note">This book was made with love on Echoes. 
                Every memory in these pages was captured, shared and cherished by the 
                people who matter most to you. Thank you for letting us be part of your story. 🌸</p>
                <p class="closing-url">echoesmemo.xyz</p>
            </div>
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
const pdfUrl = await generatePDFWithAPI2PDF(interiorHTML, bookSize);
console.log('Interior PDF URL:', pdfUrl);

console.log('Generating cover PDF...');
const coverHTML = generateCoverHTML(scrapbook, coverStyle, customCoverUrl);
const coverPdfUrl = await generatePDFWithAPI2PDF(coverHTML, bookSize);
console.log('Cover PDF URL:', coverPdfUrl);

       
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
try {
    await sendPrintConfirmationEmail(
        req.user.email,
        printJob.data.id,
        bookSize,
        '7-14 business days'
    );
    console.log('Confirmation email sent');
} catch (emailError) {
    console.error('Email error:', emailError.message);
}
 res.status(200).json({
    message: 'Print order created successfully!',
    orderId: printJob.data.id,
    estimatedDelivery: '7-14 business days'
});

       
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