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


const generatePDFWithAPI2PDF = async (html, bookSize, customWidth = null, customHeight = null) => {
    const a2pClient = new Api2Pdf(process.env.API2PDF_KEY);
    
    const pageSizes = {
        small: { width: 5.83, height: 8.27 },
        standard: { width: 6, height: 9 },
        premium: { width: 8.5, height: 11 }
    };

    const size = pageSizes[bookSize] || pageSizes.standard;
    const width = customWidth || size.width;
    const height = customHeight || size.height;

    const result = await a2pClient.chromeHtmlToPdf(html, {
        inlinePdf: false,
        fileName: `echoes_${Date.now()}.pdf`,
        options: {
            paperWidth: width,
            paperHeight: height,
            marginTop: 0,
            marginBottom: 0 ,
            marginLeft: 0,
            marginRight: 0,
            printBackground: true,
        }
    });
    if(!result.Success){
        throw new Error(result.Error || 'PDF generation failed');
    }
    return result.FileUrl;
};
const generateInteriorHTML = (scrapbook, memories, dedicationNote, bookStyle = 'polaroid') => {
    const memoriesHTML = memories.map((memory) => {
        switch (bookStyle) {
            case 'magazine':
                return `
                    <div class="memory-page magazine-page">
                        <img src="${memory.image}" alt="${memory.title}" class="magazine-img" />
                        <div class="magazine-overlay">
                            <h2>${memory.title}</h2>
                            ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
                            <p class="meta">By ${memory.createdBy?.username} • ${new Date(memory.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="page-break"></div>
                `;
            case 'classic':
                return `
                    <div class="memory-page classic-page">
                        <div class="classic-image">
                            <img src="${memory.image}" alt="${memory.title}" />
                        </div>
                        <div class="classic-text">
                            <h2>${memory.title}</h2>
                            ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
                            <p class="meta">By ${memory.createdBy?.username}</p>
                            <p class="meta">${new Date(memory.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="page-break"></div>
                `;
            case 'minimal':
                return `
                    <div class="memory-page minimal-page">
                        <img src="${memory.image}" alt="${memory.title}" class="minimal-img" />
                        <h2>${memory.title}</h2>
                        <p class="meta">${new Date(memory.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="page-break"></div>
                `;
            default: // polaroid
                return `
                    <div class="memory-page polaroid-page">
                        <div class="polaroid">
                            <img src="${memory.image}" alt="${memory.title}" />
                            <div class="polaroid-caption">
                                <h2>${memory.title}</h2>
                                ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
                                <p class="meta">By ${memory.createdBy?.username} • ${new Date(memory.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="page-break"></div>
                `;
        }
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Georgia, serif; background: #FDF6EC; color: #3D2B1F; }
                
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
                }
                .dedication {
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
                .page-break { page-break-after: always; }
                .memory-page { height: 100vh; }

            
                .polaroid-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #FDF6EC;
                    padding: 30px;
                }
                .polaroid {
                    background: white;
                    padding: 15px 15px 40px 15px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .polaroid img {
                    width: 100%;
                    height: 380px;
                    object-fit: cover;
                    display: block;
                }
                .polaroid-caption { padding: 15px 10px 5px 10px; }
                .polaroid-caption h2 { font-size: 22px; color: #3D2B1F; margin-bottom: 8px; }

              
                .magazine-page {
                    position: relative;
                    overflow: hidden;
                }
                .magazine-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .magazine-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(35,32,32,0.92));
                    padding: 60px 40px 40px;
                    color: #fff2d7;
                }
                .magazine-overlay h2 { font-size: 32px; margin-bottom: 10px; }

                
                .classic-page {
                    display: flex;
                    background: white;
                }
                .classic-image { width: 55%; height: 100vh; }
                .classic-image img { width: 100%; height: 100%; object-fit: cover; }
                .classic-text {
                    width: 45%;
                    padding: 60px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 15px;
                }
                .classic-text h2 { font-size: 28px; color: #3D2B1F; }

                
                .minimal-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    padding: 40px;
                    gap: 20px;
                    text-align: center;
                }
                .minimal-img {
                    width: 100%;
                    max-height: 75vh;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .minimal-page h2 { font-size: 26px; color: #3D2B1F; }

                /* Shared */
                .description { font-size: 15px; color: #8B6F61; line-height: 1.7; margin-bottom: 8px; }
                .meta { font-size: 13px; color: #C9627D; font-style: italic; }

                /* Closing */
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
                .closing-logo { font-size: 36px; color: #C9627D; letter-spacing: 5px; margin-bottom: 30px; }
                .closing-note { font-size: 16px; font-style: italic; color: rgba(255,242,215,0.8); max-width: 450px; line-height: 2; margin-bottom: 30px; }
                .closing-url { font-size: 13px; color: rgba(255,242,215,0.4); letter-spacing: 2px; }
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
                <p class="closing-logo">ECHOES</p>
                <p class="closing-note">This book was made with love on Echoes. Every memory in these pages was captured, shared and cherished by the people who matter most to you. Thank you for letting us be part of your story. 🌸</p>
                <p class="closing-url">echoesmemo.xyz</p>
            </div>
        </body>
        </html>
    `;
};
const generateCoverHTML = (scrapbook, coverStyle, customCoverUrl,customWidth = null, customHeight = null) => {
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


      const coverSizes = {
        small: { width: 11.96, height: 8.52 },
        standard: { width: 12.34, height: 9.25 },
        premium: { width: 17.39, height: 11.25 }
    };

    const size = coverSizes[bookSize] || coverSizes.standard;
    const width = customWidth || size.width;
    const height = customHeight || size.height;


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
    console.log("Book Style:", req.body.bookStyle)
    try {
        const { scrapbookId, dedicationNote, coverStyle, bookSize, shippingAddress, customCoverUrl, bookStyle } = req.body;

        const scrapbook = await Scrapbook.findById(scrapbookId);
        const memories = await Memory.find({ scrapbook: scrapbookId }).populate('createdBy', 'username');

        if (!scrapbook) {
            return res.status(404).json({ message: 'Scrapbook not found' });
        }

        console.log('Generating interior PDF...');
const interiorHTML = generateInteriorHTML(scrapbook, memories, dedicationNote, bookStyle || 'polaroid');
const pdfUrl = await generatePDFWithAPI2PDF(interiorHTML, bookSize);
console.log('Interior PDF URL:', pdfUrl);

   

        const podPackageIds = {
            small: '0583X0827FCPRECW080CW444MXX',
            standard: '0600X0900FCPRELW080CW444GNG',
            premium: '0850X1100FCPRELW080CW444GNG'
        };
        console.log('Getting Lulu token...');
        const token = await getLuluToken();

// Get cover dimensions from Lulu
const coverDimensions = await axios.post(
    'https://api.lulu.com/cover-dimensions/',
    {
        pod_package_id: podPackageIds[bookSize],
        interior_page_count: memories.length + 2
    },
    {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }
);
console.log('Cover dimensions:', JSON.stringify(coverDimensions.data,null,2));

const coverWidth = coverDimensions.data.width_in;
const coverHeight = coverDimensions.data.height_in;

console.log('Cover dimensions:', coverWidth, coverHeight);


console.log('Generating cover PDF...');
const coverHTML = generateCoverHTML(scrapbook, coverStyle, customCoverUrl);
const coverPdfUrl = await generatePDFWithAPI2PDF(coverHTML, bookSize, coverWidth, coverHeight);
console.log('Cover PDF URL:', coverPdfUrl);
 
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
    console.error('Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    const errorData = error.response?.data;
    if(Buffer.isBuffer(errorData)){
        console.error("PDF error:", Buffer.from(errorData).toString('utf-8'));
    } else {
        console.error('Print order error:', JSON.stringify(error.response?.data, null, 2) || error.message);
    }
    res.status(500).json({ message: error.response?.data?.detail || error.message || 'Unknown error' });
}
};

module.exports = { createPrintOrder };