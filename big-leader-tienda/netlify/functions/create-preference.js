const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { moduleId, moduleName, price, userId } = JSON.parse(event.body);
        
        const accessToken = 'TEST-7652984634973086-111720-c8bead0861955cd6b931554e04b93ffd-1303689043';
        
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', {
            items: [
                {
                    title: `Módulo BIG LEADER: ${moduleName}`,
                    unit_price: parseFloat(price),
                    quantity: 1,
                    currency_id: 'COP'
                }
            ],
            back_urls: {
                success: `${process.env.URL || 'https://your-site.netlify.app'}/success.html`,
                failure: `${process.env.URL || 'https://your-site.netlify.app'}/failure.html`, 
                pending: `${process.env.URL || 'https://your-site.netlify.app'}/success.html`
            },
            auto_return: 'approved',
            external_reference: `module_${moduleId}_user_${userId}`
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error('Error creating preference:', error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Error creating payment preference',
                details: error.response?.data || error.message 
            })
        };
    }
};