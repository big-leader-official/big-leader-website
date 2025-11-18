const firebaseConfig = {
    apiKey: "AIzaSyB8-7yoNo04StvmNl44IKMwSOQV8-xBkIY",
    authDomain: "big-leader-1f64a.firebaseapp.com",
    projectId: "big-leader-1f64a",
    storageBucket: "big-leader-1f64a.firebasestorage.app",
    messagingSenderId: "983535635868",
    appId: "1:983535635868:web:1f40d468cbd8389fb7cc59"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeAuth();
    initializeNavigation();
    initializePayments();
    initializeAnimations();
    checkAuthenticationState();
}

function initializeAuth() {
    const openLoginBtn = document.getElementById('openLogin');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const authContainer = document.getElementById('authContainer');

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', function() {
            authModal.classList.add('active');
            authContainer.classList.remove('sign-up-mode');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeAuthModal);
    }

    if (sign_up_btn) {
        sign_up_btn.addEventListener('click', function() {
            authContainer.classList.add('sign-up-mode');
        });
    }

    if (sign_in_btn) {
        sign_in_btn.addEventListener('click', function() {
            authContainer.classList.remove('sign-up-mode');
        });
    }

    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeAuthModal();
        }
    });

    document.querySelectorAll('.social-icon .fa-google').forEach(icon => {
        icon.closest('.social-icon').addEventListener('click', function(e) {
            e.preventDefault();
            signInWithGoogle();
        });
    });

    document.querySelectorAll('.social-icon .fa-facebook-f').forEach(icon => {
        icon.closest('.social-icon').addEventListener('click', function(e) {
            e.preventDefault();
            signInWithFacebook();
        });
    });

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
    });
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        handleSuccessfulLogin(result.user);
    } catch (error) {
        console.error('Error signing in with Google:', error);
        alert('Error al iniciar sesión con Google: ' + error.message);
    }
}

async function signInWithFacebook() {
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        const result = await firebase.auth().signInWithPopup(provider);
        handleSuccessfulLogin(result.user);
    } catch (error) {
        console.error('Error signing in with Facebook:', error);
        alert('Error al iniciar sesión con Facebook: ' + error.message);
    }
}

function handleSuccessfulLogin(user) {
    alert(`¡Bienvenido ${user.displayName || user.email}!`);
    closeAuthModal();
    showMemberArea(user);
    updateUserInterface(user);
}

function showMemberArea(user) {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('memberArea').style.display = 'block';
    
    const userName = document.querySelector('.dashboard-header h1');
    const userEmail = document.querySelector('.dashboard-header p');

    if (userName) {
        userName.textContent = `Bienvenido, ${user.displayName || 'Líder'}`;
    }
    if (userEmail) {
        userEmail.textContent = user.email ? `Email: ${user.email}` : 'Centro de Transformación Personal';
    }

    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader && !document.querySelector('.logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        logoutBtn.className = 'logout-btn';
        logoutBtn.style.cssText = `
            background: #c8551e;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 0.9rem;
        `;
        logoutBtn.onclick = signOut;
        dashboardHeader.appendChild(logoutBtn);
    }

    loadPurchasedModules(user.uid);
    updateNavbarForLoggedIn(user);
}

function updateNavbarForLoggedIn(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Mi Cuenta';
        loginBtn.onclick = () => {
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('memberArea').style.display = 'block';
        };
        
        const existingLogoutBtn = document.querySelector('.logout-nav-btn');
        if (!existingLogoutBtn) {
            const logoutNavBtn = document.createElement('button');
            logoutNavBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Salir';
            logoutNavBtn.className = 'logout-nav-btn';
            logoutNavBtn.style.cssText = `
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                margin-left: 1rem;
                font-size: 0.9rem;
            `;
            logoutNavBtn.onclick = signOut;
            loginBtn.parentNode.appendChild(logoutNavBtn);
        }
    }
}

function signOut() {
    firebase.auth().signOut().then(() => {
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('memberArea').style.display = 'none';
        
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = 'Iniciar Sesión';
            loginBtn.onclick = () => {
                document.getElementById('authModal').classList.add('active');
            };
        }
        
        const logoutNavBtn = document.querySelector('.logout-nav-btn');
        if (logoutNavBtn) {
            logoutNavBtn.remove();
        }
        
        alert('Sesión cerrada correctamente');
    });
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            scrollToSection(targetId);
        });
    });

    const exploreBtn = document.querySelector('.btn-primary');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('memberArea').style.display = 'none';
            setTimeout(() => {
                scrollToSection('#modulos');
            }, 100);
        });
    }

    const videoBtn = document.querySelector('.btn-secondary');
    if (videoBtn) {
        videoBtn.addEventListener('click', function() {
            scrollToSection('.video-section');
        });
    }

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        const navMenuLinks = navMenu.querySelectorAll('.nav-link, .login-btn');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 33, 93, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(0, 33, 93, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
        lastScrollY = window.scrollY;
    });
}

function scrollToSection(selector) {
    const targetSection = document.querySelector(selector);
    if (targetSection) {
        window.scrollTo({
            top: targetSection.offsetTop - 70,
            behavior: 'smooth'
        });
    }
}

function initializePayments() {
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Por favor inicia sesión para comprar módulos');
                document.getElementById('openLogin').click();
                return;
            }

            const moduleId = this.getAttribute('data-module');
            showPaymentModal(moduleId, currentUser);
        });
    });
}

function showPaymentModal(moduleId, user) {
    const moduleNames = {
        '1': 'Playing by the Rules',
        '2': 'Boulevard', 
        '3': 'Fantasía Épica'
    };
    
    const moduleName = moduleNames[moduleId];
    const modulePrice = 70000;
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'payment-modal-overlay';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
    `;
    
    confirmModal.innerHTML = `
        <div class="payment-modal" style="
            background: linear-gradient(135deg, #00215d, #001a4a);
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            border: 2px solid #c8551e;
            color: white;
        ">
            <div class="modal-header" style="margin-bottom: 1.5rem;">
                <h3 style="color: #c8551e; margin-bottom: 0.5rem; font-size: 1.5rem;">¡Excelente elección!</h3>
                <p style="color: #ffffff; opacity: 0.9;">Has seleccionado el módulo:</p>
            </div>
            
            <div class="module-info" style="
                background: rgba(200, 85, 30, 0.1);
                padding: 1rem;
                border-radius: 12px;
                margin-bottom: 2rem;
                border-left: 4px solid #c8551e;
            ">
                <h4 style="color: #ffffff; margin-bottom: 0.5rem;">${moduleName}</h4>
                <p style="color: #c8551e; font-weight: 600; font-size: 1.2rem; margin: 0;">$70,000 COP</p>
            </div>
            
            <div class="payment-options" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #ffffff;">Método de pago:</h4>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button id="payWithMercadoPago" class="payment-btn primary" style="
                        background: #c8551e;
                        color: white;
                        border: none;
                        padding: 1.2rem 2.5rem;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        font-size: 1.1rem;
                        width: 100%;
                    ">
                        <i class="fas fa-credit-card"></i>
                        Pagar con Mercado Pago
                    </button>
                </div>
            </div>
            
            <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: center;">
                <button id="cancelBuy" style="
                    background: transparent;
                    color: #cccccc;
                    border: 2px solid #666;
                    padding: 0.8rem 2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    setTimeout(() => {
        confirmModal.style.opacity = '1';
    }, 10);
    
    document.getElementById('payWithMercadoPago').addEventListener('click', function() {
        processPaymentWithMercadoPago(moduleId, moduleName, modulePrice, user.uid);
        document.body.removeChild(confirmModal);
    });
    
    document.getElementById('cancelBuy').addEventListener('click', function() {
        document.body.removeChild(confirmModal);
    });
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
        }
    });
}

async function processPaymentWithMercadoPago(moduleId, moduleName, price, userId) {
    try {
        console.log('Starting payment process...');
        
        sessionStorage.setItem('pendingPurchase', JSON.stringify({
            id: moduleId,
            name: moduleName,
            price: price,
            userId: userId
        }));
        
        await processPayment(moduleId, moduleName, price, userId);
        
    } catch (error) {
        console.error('Error in payment process:', error);
        alert('Error al procesar el pago: ' + error.message);
    }
}

function showManualPaymentInstructions(moduleId, moduleName, user) {
    const instructionsModal = document.createElement('div');
    instructionsModal.className = 'instructions-modal';
    instructionsModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3001;
    `;
    
    instructionsModal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            color: #333;
        ">
            <h3 style="color: #00215d; margin-bottom: 1rem;">Instrucciones de Pago</h3>
            
            <div style="text-align: left; margin-bottom: 1.5rem;">
                <p><strong>Módulo:</strong> ${moduleName}</p>
                <p><strong>Precio:</strong> $70,000 COP</p>
                <p><strong>Método:</strong> Transferencia Bancaria</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <h4 style="color: #c8551e; margin-bottom: 0.5rem;">Datos para transferencia:</h4>
                <p><strong>Banco:</strong> Bancolombia</p>
                <p><strong>Número de cuenta:</strong> 123-456-789</p>
                <p><strong>Titular:</strong> BIG LEADER CENTRO DE LIDERAZGO</p>
                <p><strong>Valor:</strong> $70,000 COP</p>
            </div>
            
            <div style="background: #fff3e0; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <p style="color: #e65100; font-size: 0.9rem;">
                    <strong>⚠️ IMPORTANTE:</strong> Después de realizar la transferencia, 
                    envía el comprobante al WhatsApp: <strong>+57 313 5048484</strong> 
                    con tu nombre y el módulo comprado.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="confirmManualPayment" style="
                    background: #c8551e;
                    color: white;
                    border: none;
                    padding: 0.8rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">Ya realicé el pago</button>
                <button id="closeInstructions" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 0.8rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(instructionsModal);
    
    document.getElementById('confirmManualPayment').addEventListener('click', function() {
        simulateManualPayment(moduleId, moduleName, user.uid);
        document.body.removeChild(instructionsModal);
    });
    
    document.getElementById('closeInstructions').addEventListener('click', function() {
        document.body.removeChild(instructionsModal);
    });
    
    instructionsModal.addEventListener('click', function(e) {
        if (e.target === instructionsModal) {
            document.body.removeChild(instructionsModal);
        }
    });
}

function addToPurchasedModules(moduleId, moduleName, userId, paymentId = null) {
    let purchasedModules = JSON.parse(localStorage.getItem('purchasedModules')) || {};
    if (!purchasedModules[userId]) {
        purchasedModules[userId] = [];
    }
    
    const alreadyPurchased = purchasedModules[userId].some(module => module.id === moduleId);
    if (!alreadyPurchased) {
        purchasedModules[userId].push({
            id: moduleId,
            name: moduleName,
            purchasedAt: new Date().toISOString(),
            file: `downloads/modulo${moduleId}.pdf`,
            paymentId: paymentId || 'manual_' + Date.now()
        });
        
        localStorage.setItem('purchasedModules', JSON.stringify(purchasedModules));
        updatePurchasedModulesUI(userId);
        alert(`¡Felicidades! Ahora tienes acceso al módulo "${moduleName}"`);
    }
}

function loadPurchasedModules(userId) {
    updatePurchasedModulesUI(userId);
}

function loadPurchasedModules(userId) {
    const purchasedModules = JSON.parse(localStorage.getItem('purchasedModules')) || {};
    const userModules = purchasedModules[userId] || [];
    const modulesList = document.getElementById('purchasedModulesList');
    
    if (!modulesList) return;
    
    if (userModules.length === 0) {
        modulesList.innerHTML = `
            <div class="no-modules" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
                <p style="color: #666; margin-bottom: 1.5rem;">Aún no has comprado módulos</p>
                <button onclick="showModulesStore()" style="
                    background: #c8551e;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin: 0.5rem;
                ">
                    <i class="fas fa-shopping-cart"></i> Comprar Módulos
                </button>
                <button onclick="showModulesSection()" style="
                    background: #00215d;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin: 0.5rem;
                ">
                    <i class="fas fa-eye"></i> Ver Catálogo
                </button>
            </div>
        `;
        return;
    }
    
    modulesList.innerHTML = userModules.map(module => `
        <div class="purchased-module" style="
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            border-left: 4px solid #c8551e;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        ">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0; color: #00215d;">${module.name}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                    Comprado: ${new Date(module.purchasedAt).toLocaleDateString()}
                </p>
            </div>
            <button onclick="downloadModule('${module.file}', '${module.name}')" style="
                background: #00215d;
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-download"></i> Descargar
            </button>
        </div>
    `).join('');
}

window.downloadModule = function(filePath, moduleName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = moduleName + '.pdf';
    link.click();
};

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.module-card, .section-title, .section-subtitle, .dimension-card, ' +
        '.intelligence-card, .circle-item, .service-card, .client-card, ' +
        '.testimonial-card, .contact-card, .action-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function checkAuthenticationState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            showMemberArea(user);
        } else {
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('memberArea').style.display = 'none';
        }
    });
}

function handleFormSubmit(form) {
    const formType = form.classList.contains('sign-in-form') ? 'login' : 'register';
    
    if (formType === 'register') {
        handleEmailRegister(form);
    } else {
        handleEmailLogin(form);
    }
}

async function handleEmailRegister(form) {
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({
            displayName: name
        });
        
        alert(`¡Bienvenido ${name}! Tu cuenta ha sido creada exitosamente.`);
        handleSuccessfulLogin(user);
        
    } catch (error) {
        console.error('Error en registro:', error);
        handleAuthError(error);
    }
}

async function handleEmailLogin(form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        alert(`¡Bienvenido de vuelta ${user.displayName || user.email}!`);
        handleSuccessfulLogin(user);
        
    } catch (error) {
        console.error('Error en login:', error);
        handleAuthError(error);
    }
}

function handleAuthError(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            alert('Este correo electrónico ya está registrado.');
            break;
        case 'auth/invalid-email':
            alert('El correo electrónico no es válido.');
            break;
        case 'auth/weak-password':
            alert('La contraseña es demasiado débil.');
            break;
        case 'auth/user-not-found':
            alert('No existe una cuenta con este correo electrónico.');
            break;
        case 'auth/wrong-password':
            alert('Contraseña incorrecta.');
            break;
        default:
            alert('Error: ' + error.message);
    }
}

function simulateManualPayment(moduleId, moduleName, userId) {
    setTimeout(() => {
        alert(`¡Gracias por tu compra! Hemos registrado tu pago manual para "${moduleName}". Te contactaremos pronto para confirmar y activar tu módulo.`);
        addToPurchasedModules(moduleId, moduleName, userId);
    }, 1000);
}

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const purchase = urlParams.get('purchase');
    
    if (purchase === 'success') {
        alert('¡Pago exitoso! Tu módulo ha sido activado.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function updateUserInterface(user) {
    const userDisplay = document.querySelector('.user-display');
    if (userDisplay) {
        userDisplay.textContent = user.displayName || user.email;
    }
}

window.showModulesStore = function() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('memberArea').style.display = 'none';
    
    const logoutNavBtn = document.querySelector('.logout-nav-btn');
    if (logoutNavBtn) {
        logoutNavBtn.remove();
    }
    
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = 'Iniciar Sesión';
        loginBtn.onclick = () => {
            document.getElementById('authModal').classList.add('active');
        };
    }
    
    setTimeout(() => {
        scrollToSection('#modulos');
    }, 300);
}

window.showModulesSection = function() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('memberArea').style.display = 'none';
    
    const logoutNavBtn = document.querySelector('.logout-nav-btn');
    if (logoutNavBtn) {
        logoutNavBtn.remove();
    }
    
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = 'Iniciar Sesión';
        loginBtn.onclick = () => {
            document.getElementById('authModal').classList.add('active');
        };
    }
    
    setTimeout(() => {
        scrollToSection('#modulos');
    }, 300);
}

checkURLParameters();