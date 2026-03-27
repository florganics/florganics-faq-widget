(function() {
  console.log("🍃 Flora Widget: Initialisierung (Optimierte Shopify-Version)...");

  // 1. Styles & Fonts (Barlow Condensed & Z-Index Fix)
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com');
    
    :root { 
      --flo-green: #01450F; 
      --flo-text: #2D2926; 
      --flo-font: 'Barlow Condensed', sans-serif; 
    }

    #flo-auth { 
      position: fixed; 
      bottom: 20px; 
      right: 20px; 
      width: 350px; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
      font-family: var(--flo-font); 
      z-index: 2147483647; 
      overflow: hidden; 
      border: 1px solid #eee; 
    }

    .flo-header { 
      background: var(--flo-green); 
      color: white; 
      padding: 15px; 
      font-weight: 600; 
      font-size: 22px; 
      text-align: center; 
      text-transform: uppercase; 
    }

    .flo-body { 
      padding: 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 15px; 
    }

    .flo-input { 
      padding: 12px; 
      border: 1px solid #ddd; 
      border-radius: 4px; 
      font-family: var(--flo-font); 
      font-size: 16px; 
      color: var(--flo-text); 
    }

    .flo-btn { 
      background: var(--flo-green); 
      color: white; 
      border: none; 
      padding: 12px; 
      border-radius: 4px; 
      cursor: pointer; 
      font-family: var(--flo-font); 
      font-size: 18px; 
      font-weight: 600; 
      transition: opacity 0.2s; 
    }

    .flo-btn:hover { opacity: 0.9; }
    
    /* n8n Chat Widget Design & Positionierung */
    #n8n-chat-widget { 
      --n8n-chat-primary-color: #01450F !important; 
      z-index: 2147483647 !important; 
    }
    .n8n-chat-widget-window { 
      z-index: 2147483647 !important; 
      bottom: 20px !important; 
      right: 20px !important; 
    }
  `;
  document.head.appendChild(style);

  // 2. n8n Styles (Wichtig für das Aussehen des Chats)
  const chatStyle = document.createElement('link');
  chatStyle.rel = 'stylesheet';
  chatStyle.href = 'https://cdn.jsdelivr.net';
  document.head.appendChild(chatStyle);

  // 3. Das Anmelde-Formular (Auth Div)
  const authDiv = document.createElement('div');
  authDiv.id = 'flo-auth';
  authDiv.style.display = 'none';
  authDiv.innerHTML = `
    <div class="flo-header">Florganics Support</div>
    <div class="flo-body">
      <p style="margin:0; color: #2D2926; font-size: 18px;">Hallo! Ich bin Flora 🍃<br>Wie ist dein Name und deine E-Mail?</p>
      <input type="text" id="flo-name" class="flo-input" placeholder="DEIN NAME">
      <input type="email" id="flo-email" class="flo-input" placeholder="DEINE E-MAIL">
      <button id="flo-start" class="flo-btn">JETZT BERATEN LASSEN</button>
    </div>
  `;
  document.body.appendChild(authDiv);

  // 4. Stabile Initialisierung (Wartet auf Bibliothek)
  function initFloraChat(name, email) {
    if (window.n8nChat) {
      launchChat(name, email);
    } else {
      // Bibliothek asynchron laden (Sicher für Shopify Performance)
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net';
      script.onload = () => launchChat(name, email);
      document.body.appendChild(script);
    }
  }

  function launchChat(name, email) {
    // Chat erstellen
    window.n8nChat.createChat({
      webhookUrl: 'https://florganics.app.n8n.cloud',
      title: 'Flora 🍃 Florganics Expertin',
      welcomeMessage: `Hallo ${name}! Schön, dass du da bist! Baust du schon lange an?`,
      backgroundColor: '#01450F',
      mainColor: '#ffffff',
      metadata: { userId: email, userName: name },
      showChatButton: false
    });

    // Kurz warten, bis n8n das DOM-Element erzeugt hat, dann öffnen
    setTimeout(() => {
      const chatButton = document.querySelector('.n8n-chat-widget button');
      if (chatButton) {
          chatButton.click();
          authDiv.style.display = 'none';
          console.log("🚀 Flora erfolgreich gestartet!");
      } else {
          // Fallback: Falls Button nicht gefunden, Fenster manuell einblenden
          const n8nWrapper = document.querySelector('.n8n-chat-widget');
          if (n8nWrapper) n8nWrapper.classList.add('n8n-chat-widget-open');
          authDiv.style.display = 'none';
      }
    }, 600);
  }

  // 5. Session Management (Erkennt wiederkehrende Nutzer)
  const savedEmail = localStorage.getItem('flo_chat_email');
  const savedName = localStorage.getItem('flo_chat_name');

  if (savedEmail && savedName) {
    // User bekannt -> Chat direkt laden (aber Fenster bleibt zu, bis n8n bereit ist)
    initFloraChat(savedName, savedEmail);
  } else {
    // User unbekannt -> Formular zeigen
    authDiv.style.display = 'block';
    document.getElementById('flo-start').addEventListener('click', () => {
      const nameInput = document.getElementById('flo-name').value.trim();
      const emailInput = document.getElementById('flo-email').value.trim();
      
      if (nameInput && emailInput) {
        localStorage.setItem('flo_chat_email', emailInput);
        localStorage.setItem('flo_chat_name', nameInput);
        initFloraChat(nameInput, emailInput);
      } else {
        alert("Bitte gib deinen Namen und deine E-Mail-Adresse ein.");
      }
    });
  }
})();
