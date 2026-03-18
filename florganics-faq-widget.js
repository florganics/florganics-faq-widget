// ========================================
// Florganics FAQ Chat Widget
// Standalone JavaScript für Shopify
// ========================================

(function() {
  // ========================================
  // CONFIGURATION - ÄNDERE DIESE 3 WERTE!
  // ========================================
  
  const CONFIG = {
    N8N_WEBHOOK: 'https://florganics.app.n8n.cloud/webhook/customer-message',
    SUPABASE_URL: 'https://kksbbpaspjeltqfwgknk.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_PQ0uqs7VkTeL6A6Pa3Lzcg_gz1fDPWI',
    API_URL: 'https://your-backend.com', // Später: dein Backend URL
    WIDGET_ID: 'florganics-faq-chat',
    THEME_COLOR: '#000000', // Schwarz für Florganics
    STORAGE_PREFIX: 'florganics_faq_',
  };

  // ========================================
  // INITIALIZATION
  // ========================================

  function initWidget() {
    // Erstelle Widget Container
    const widgetHTML = `
      <div id="${CONFIG.WIDGET_ID}" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-width: 100%;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div id="faq-chat-container" style="
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0,0,0,0.16);
          height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="
            background: ${CONFIG.THEME_COLOR};
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
          ">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Florganics FAQ Support</h3>
            <button id="faq-minimize" style="
              background: none;
              border: none;
              color: white;
              font-size: 20px;
              cursor: pointer;
              padding: 0;
              width: 24px;
              height: 24px;
            ">−</button>
          </div>

          <!-- Messages Container -->
          <div id="faq-messages" style="
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            gap: 12px;
          ">
            <div style="
              text-align: center;
              color: #999;
              padding: 20px;
              font-size: 14px;
            ">
              Hallo! 👋 Wie kann ich dir helfen?
            </div>
          </div>

          <!-- Input -->
          <div style="
            padding: 12px;
            border-top: 1px solid #eee;
            background: white;
            flex-shrink: 0;
          ">
            <div style="display: flex; gap: 8px;">
              <input 
                id="faq-input" 
                type="text" 
                placeholder="Deine Frage hier..." 
                style="
                  flex: 1;
                  padding: 12px;
                  border: 1px solid #ddd;
                  border-radius: 6px;
                  font-size: 14px;
                  box-sizing: border-box;
                  font-family: inherit;
                "
              />
              <button 
                id="faq-send" 
                style="
                  padding: 12px 16px;
                  background: ${CONFIG.THEME_COLOR};
                  color: white;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: 600;
                  font-size: 14px;
                  white-space: nowrap;
                "
              >Senden</button>
            </div>
          </div>
        </div>

        <!-- Toggle Button (wenn minimiert) -->
        <button id="faq-toggle" style="
          display: none;
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${CONFIG.THEME_COLOR};
          color: white;
          border: none;
          cursor: pointer;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
        ">💬</button>
      </div>
    `;

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Setup Event Listeners
    setupEventListeners();
    
    // Lade User Session
    loadUserSession();
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  function setupEventListeners() {
    const input = document.getElementById('faq-input');
    const sendBtn = document.getElementById('faq-send');
    const minimizeBtn = document.getElementById('faq-minimize');
    const toggleBtn = document.getElementById('faq-toggle');
    const chatContainer = document.getElementById('faq-chat-container');

    // Send message
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (input) input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Minimize
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        if (chatContainer) chatContainer.style.display = 'none';
        if (toggleBtn) toggleBtn.style.display = 'block';
      });
    }

    // Toggle
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (chatContainer) chatContainer.style.display = 'flex';
        if (toggleBtn) toggleBtn.style.display = 'none';
      });
    }
  }

  // ========================================
  // USER SESSION MANAGEMENT
  // ========================================

  function loadUserSession() {
    const token = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'jwt_token');
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'user') || '{}');

    if (!token || !user.id) {
      showWelcomeOrLoginForm();
    } else {
      loadConversations(user.id);
    }
  }

  function showWelcomeOrLoginForm() {
    const messagesContainer = document.getElementById('faq-messages');
    const input = document.getElementById('faq-input');
    const sendBtn = document.getElementById('faq-send');

    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h3 style="margin: 0 0 20px; font-size: 16px; color: #000;">Willkommen! 👋</h3>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; margin-bottom: 6px; color: #666; font-weight: 600;">Email</label>
          <input id="login-email" type="email" placeholder="deine@email.com" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
          " />
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; margin-bottom: 6px; color: #666; font-weight: 600;">Passwort</label>
          <input id="login-password" type="password" placeholder="••••••" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
          " />
        </div>

        <button id="login-btn" style="
          width: 100%;
          padding: 10px;
          background: ${CONFIG.THEME_COLOR};
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        ">Anmelden</button>

        <button id="register-btn" style="
          width: 100%;
          padding: 10px;
          background: #f0f0f0;
          color: #000;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Neues Konto erstellen</button>
      </div>
    `;

    if (input) input.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'none';

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', showRegisterForm);
  }

  function handleLogin() {
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';

    if (!email || !password) {
      alert('Bitte Email und Passwort eingeben');
      return;
    }

    const messagesContainer = document.getElementById('faq-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Lädt...</div>';
    }

    // Für jetzt: Simuliere Login
    // In echtem System: API Call zu deinem Backend
    const userData = {
      id: 'customer-' + Date.now(),
      email: email,
      full_name: email.split('@')[0]
    };

    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'jwt_token', 'mock-token-' + Date.now());
    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'user', JSON.stringify(userData));

    loadConversations(userData.id);
  }

  function showRegisterForm() {
    const messagesContainer = document.getElementById('faq-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 16px; font-size: 14px;">Neues Konto</h3>
        
        <div style="margin-bottom: 12px;">
          <input id="register-name" type="text" placeholder="Dein Name" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
          " />
        </div>

        <div style="margin-bottom: 12px;">
          <input id="register-email" type="email" placeholder="deine@email.com" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
          " />
        </div>

        <div style="margin-bottom: 16px;">
          <input id="register-password" type="password" placeholder="Passwort" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
          " />
        </div>

        <button id="register-submit" style="
          width: 100%;
          padding: 10px;
          background: ${CONFIG.THEME_COLOR};
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        ">Registrieren</button>

        <button id="back-to-login" style="
          width: 100%;
          padding: 10px;
          background: #f0f0f0;
          color: #000;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Zurück</button>
      </div>
    `;

    const submitBtn = document.getElementById('register-submit');
    const backBtn = document.getElementById('back-to-login');

    if (submitBtn) submitBtn.addEventListener('click', handleRegister);
    if (backBtn) backBtn.addEventListener('click', showWelcomeOrLoginForm);
  }

  function handleRegister() {
    const name = document.getElementById('register-name')?.value || '';
    const email = document.getElementById('register-email')?.value || '';
    const password = document.getElementById('register-password')?.value || '';

    if (!name || !email || !password) {
      alert('Bitte alle Felder ausfüllen');
      return;
    }

    const messagesContainer = document.getElementById('faq-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Registriert...</div>';
    }

    // Für jetzt: Simuliere Register
    const userData = {
      id: 'customer-' + Date.now(),
      email: email,
      full_name: name
    };

    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'jwt_token', 'mock-token-' + Date.now());
    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'user', JSON.stringify(userData));

    loadConversations(userData.id);
  }

  // ========================================
  // CONVERSATIONS & MESSAGES
  // ========================================

  function loadConversations(userId) {
    const messagesContainer = document.getElementById('faq-messages');
    const input = document.getElementById('faq-input');
    const sendBtn = document.getElementById('faq-send');

    if (messagesContainer) {
      messagesContainer.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">Bereit für deine Fragen! 🎯</div>';
    }

    if (input) input.style.display = 'block';
    if (sendBtn) sendBtn.style.display = 'block';

    // Erstelle neue Conversation für diesen User
    const conversationId = 'conv-' + userId + '-' + Date.now();
    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'conversation_id', conversationId);
  }

  // ========================================
  // SEND MESSAGE
  // ========================================

  function sendMessage() {
    const input = document.getElementById('faq-input');
    const text = input?.value?.trim() || '';

    if (!text) return;

    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'user') || '{}');
    const conversationId = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'conversation_id');

    if (!user.id || !conversationId) {
      alert('Bitte melde dich an');
      return;
    }

    // Zeige User Message
    const messagesContainer = document.getElementById('faq-messages');
    if (messagesContainer) {
      const msgDiv = document.createElement('div');
      msgDiv.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;
      `;
      msgDiv.innerHTML = `
        <div style="
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 8px;
          background: ${CONFIG.THEME_COLOR};
          color: white;
          font-size: 14px;
          line-height: 1.4;
        ">${text}</div>
      `;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    if (input) input.value = '';

    // Sende zu n8n
    fetch(CONFIG.N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: user.id,
        conversation_id: conversationId,
        message_text: text,
        timestamp: new Date().toISOString()
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.response) {
        // Zeige AI Response
        const aiDiv = document.createElement('div');
        aiDiv.style.cssText = `
          display: flex;
          justify-content: flex-start;
          margin-bottom: 8px;
        `;
        aiDiv.innerHTML = `
          <div style="
            max-width: 70%;
            padding: 10px 14px;
            border-radius: 8px;
            background: #e8e8e8;
            color: #000;
            font-size: 14px;
            line-height: 1.4;
          ">
            <div>${data.response.text}</div>
            <div style="font-size: 11px; color: #999; margin-top: 6px;">
              Sicherheit: ${Math.round(parseFloat(data.response.confidence) * 100)}%
            </div>
          </div>
        `;
        if (messagesContainer) {
          messagesContainer.appendChild(aiDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    })
    .catch(err => {
      console.error('Widget Error:', err);
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        padding: 10px 14px;
        border-radius: 8px;
        background: #ffe8e8;
        color: #d00;
        font-size: 13px;
      `;
      errorDiv.innerHTML = 'Fehler beim Senden. Bitte versuche später erneut.';
      if (messagesContainer) {
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // ========================================
  // START
  // ========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
