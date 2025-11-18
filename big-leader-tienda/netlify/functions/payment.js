const mp = new MercadoPago('TEST-3bctea2c-eebc-4d00-8fa8-ff665c02070d', {
    locale: 'es-CO'
});

async function createPreference(moduleId, moduleName, modulePrice, userId) {
    try {
        console.log('Creating preference for:', moduleName, modulePrice);
        
        const response = await fetch('/.netlify/functions/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                moduleId: moduleId,
                moduleName: moduleName,
                price: modulePrice,
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Preference created:', data);
        
        return data.id;
    } catch (error) {
        console.error('Error creating preference:', error);
        return null;
    }
}

async function processPayment(moduleId, moduleName, modulePrice, userId) {
    try {
        const preferenceId = await createPreference(moduleId, moduleName, modulePrice, userId);
        
        if (preferenceId) {
            console.log('Redirecting to Mercado Pago with preference:', preferenceId);
            window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${preferenceId}`;
        } else {
            throw new Error('No se pudo crear la preferencia de pago');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
}

function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    const preferenceId = urlParams.get('preference_id');
    
    console.log('Payment status params:', { status, paymentId, preferenceId });
    
    if (status === 'approved' && paymentId) {
        completePurchase(paymentId);
    }
}

function completePurchase(paymentId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('No user found for purchase completion');
        return;
    }

    const moduleData = JSON.parse(sessionStorage.getItem('pendingPurchase'));
    if (moduleData) {
        console.log('Completing purchase:', moduleData);
        addToPurchasedModules(moduleData.id, moduleData.name, user.uid, paymentId);
        sessionStorage.removeItem('pendingPurchase');
        
        window.location.href = '/?purchase=success&module=' + moduleData.id;
    } else {
        console.error('No pending purchase data found');
    }
}