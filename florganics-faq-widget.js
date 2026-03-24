(function() {
  console.log("🍃 Flora Widget: Initialisierung...");

  // 1. Styles & Fonts (Barlow Condensed für den Florganics-Look)
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com');
    :root { --flo-green: #01450F; --flo-text: #2D2926; --flo-font: 'Barlow Condensed', sans-serif; }
    #flo-auth { position: fixed; bottom: 20px; right: 20px; width: 350px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: var(--flo-font); z-index: 2147483647; overflow: hidden; border: 1px solid #eee; }
    .flo-header { background: var(--flo-green); color: white; padding: 15px; font-weight: 600; font-size: 22px; text-align: center; text-transform: uppercase; }
    .flo-body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
    .flo-input { padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: var(--flo-font); font-size: 16px; color: var(--flo-text); }
    .flo-btn { background: var(--flo-green); color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-family: var(--flo-font); font-size: 18px; font-weight: 600; transition: opacity 0.2s; }
    .flo-btn:hover { opacity: 0.9; }
  `;
  document.head.appendChild(style);

  // 2. n8n Chat Bibliothek laden
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://cdn.jsdelivr.net';
  document.head.appendChild(style);
  document.body.appendChild(script);

  // 3. Auth Formular erstellen
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

  // 4. n8n Chat Initialisierung
  function startFlora(name, email) {
    if (window.Chat) {
      window.Chat.createChat({
        webhookUrl: 'https://florganics.app.n8n.cloud',
        title: 'Flora 🍃 Florganics Expertin',
        welcomeMessage: `Hallo ${name}! Schön, dass du da bist! Baust du schon lange an?`,
        backgroundColor: '#01450F',
        mainColor: '#ffffff',
        metadata: { userId: email, userName: name }
      });
    }
  }

  // Session Management
  script.onload = () => {
    const sEmail = localStorage.getItem('flo_chat_email');
    const sName = localStorage.getItem('flo_chat_name');

    if (sEmail && sName) {
      startFlora(sName, sEmail);
    } else {
      authDiv.style.display = 'block';
      document.getElementById('flo-start').addEventListener('click', () => {
        const name = document.getElementById('flo-name').value;
        const email = document.getElementById('flo-email').value;
        if (name && email) {
          localStorage.setItem('flo_chat_email', email);
          localStorage.setItem('flo_chat_name', name);
          authDiv.style.display = 'none';
          startFlora(name, email);
        } else {
          alert("Bitte Name und E-Mail eingeben, damit Flora dich richtig beraten kann.");
        }
      });
    }
  };
})();
