const mp = new MercadoPago('TEST-3bctea2c-eebc-4d00-8fa8-ff665c02070d', {
    locale: 'es-CO'
});

async function createPreference(moduleId, moduleName, modulePrice, userId) {
    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer TEST-7652984634973086-111720-c8bead0861955cd6b931554e04b93ffd-1303689043',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: [
                    {
                        title: `Módulo BIG LEADER: ${moduleName}`,
                        unit_price: parseFloat(modulePrice),
                        quantity: 1,
                        currency_id: 'COP'
                    }
                ],
                back_urls: {
                    success: window.location.origin + '/success.html',
                    failure: window.location.origin + '/failure.html',
                    pending: window.location.origin + '/success.html'
                },
                auto_return: 'approved'
            })
        });

        const preference = await response.json();
        return preference.id;
    } catch (error) {
        console.error('Error creating preference:', error);
        return null;
    }
}

async function processPayment(moduleId, moduleName, modulePrice, userId) {
    try {
        const preferenceId = await createPreference(moduleId, moduleName, modulePrice, userId);
        if (preferenceId) {
            window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${preferenceId}`;
        } else {
            throw new Error('No se pudo crear la preferencia de pago');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error al procesar el pago. Por favor intenta nuevamente más tarde.');
    }
}

function simulatePaymentFallback(moduleId, moduleName, userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const transactionId = 'SIM_' + Date.now();
            resolve(transactionId);
        }, 1000);
    });
}

async function processPayment(moduleId, moduleName, modulePrice, userId) {
    try {
        const preferenceId = await createPreference(moduleId, moduleName, modulePrice, userId);
        window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${preferenceId}`;
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
}

function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    
    if (status === 'approved' && paymentId) {
        completePurchase(paymentId);
    }
}

function completePurchase(paymentId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const moduleData = JSON.parse(sessionStorage.getItem('pendingPurchase'));
    if (moduleData) {
        addToPurchasedModules(moduleData.id, moduleData.name, user.uid, paymentId);
        sessionStorage.removeItem('pendingPurchase');
        window.location.href = '/?purchase=success';
    }
}