(function() {
  console.log("Florganics Widget: Start geladen");

  // 1. Schriften & Styles
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://cdn.jsdelivr.net');
    :root { --flo-green: #01450F; --flo-text: #2D2926; --flo-font: 'Barlow Condensed', sans-serif; }
    #flo-auth { position: fixed; bottom: 20px; right: 20px; width: 350px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: var(--flo-font); z-index: 2147483647; overflow: hidden; border: 1px solid #eee; }
    .flo-header { background: var(--flo-green); color: white; padding: 15px; font-weight: 600; font-size: 22px; text-align: center; text-transform: uppercase; }
    .flo-body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
    .flo-input { padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: var(--flo-font); font-size: 16px; color: var(--flo-text); }
    .flo-btn { background: var(--flo-green); color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-family: var(--flo-font); font-size: 18px; font-weight: 600; }
    .n8n-chat-widget { font-family: var(--flo-font) !important; z-index: 2147483647 !important; }
  `;
  document.head.appendChild(style);

  // 2. Auth Formular erstellen
  const authDiv = document.createElement('div');
  authDiv.id = 'flo-auth';
  authDiv.innerHTML = `
    <div class="flo-header">Florganics Support</div>
    <div class="flo-body">
      <p style="margin:0; color: #2D2926; font-size: 18px;">Bitte kurz anmelden, um den Chat zu starten:</p>
      <input type="text" id="flo-name" class="flo-input" placeholder="DEIN NAME">
      <input type="email" id="flo-email" class="flo-input" placeholder="DEINE E-MAIL">
      <button id="flo-start" class="flo-btn">CHAT STARTEN</button>
    </div>
  `;
  document.body.appendChild(authDiv);

  // 3. n8n Chat Funktion
  async function initN8nChat(name, email) {
    console.log("Versuche n8n Chat zu starten für:", name);
    try {
      const chatModule = await import('https://cdn.jsdelivr.net');
      chatModule.createChat({
        webhookUrl: 'https://florganics.app.n8n.cloud',
        title: 'Florganics Support',
        welcomeMessage: 'Hallo ' + name + '! Wie kann ich dir helfen? 🌿',
        backgroundColor: '#01450F',
        mainColor: '#ffffff',
        metadata: { userId: email, userName: name }
      });
      console.log("n8n Chat erfolgreich initialisiert");
    } catch (err) {
      console.error("Fehler beim Laden des n8n Chat Moduls:", err);
    }
  }

  // Session Check
  const sEmail = localStorage.getItem('flo_chat_email');
  const sName = localStorage.getItem('flo_chat_name');

  if (sEmail && sName) {
    authDiv.style.display = 'none';
    initN8nChat(sName, sEmail);
  } else {
    authDiv.style.display = 'block';
    document.getElementById('flo-start').addEventListener('click', () => {
      const name = document.getElementById('flo-name').value;
      const email = document.getElementById('flo-email').value;
      if (name && email) {
        localStorage.setItem('flo_chat_email', email);
        localStorage.setItem('flo_chat_name', name);
        authDiv.style.display = 'none';
        initN8nChat(name, email);
      } else {
        alert("Bitte Name und E-Mail eingeben");
      }
    });
  }
})();

    });
  }
})();
