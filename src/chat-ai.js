class ApiPickerChatAi {
  
  static init(config) {
    const instance = new ApiPickerChatAi(config);
   
      (async () => {
        await instance.setupEvents();
        await instance.checkAuth();
        instance.render();
      })()
    return instance;
  }

  constructor(config) {
    this.config = config;
    this.isOpen = false;
    this.user = null;
    this.apiUrl='http://127.0.0.1:7007';
  }
  log(...str) {
    if (this.config?.debug) {
      console.log('ApiPickerAi', str)
    }
  }
  render() {
    this.container = document.createElement('div');
    this.container.id = 'chat-container';
    this.container.innerHTML = `
        <div class="chat-toggle" >
          💬
        </div>
       <div class="chat-container">
  <div class="chat-header">
    <h3>${this?.app?.setting?.ainame}</h3>
    <button class="chat-close-btn">×</button>
  </div>
  
  <div class="chat-body">
   ${ this?.app?.setting?.welcome && `<div class="chat-message other-message">
   ${this?.app?.setting?.welcome}
      <span class="message-meta">${this.getTime(new Date())}</span>
    </div>`}
    
   
  </div>
  
  <div class="chat-status"> 
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  </div>
  
  <div class="chat-footer">
    <div class="chat-input-group">
      <input type="text" class="chat-input" id="chat-input" placeholder="${this?.app?.setting?.defaultText || '...'}">
      <button class="chat-send-btn">Send</button>
    </div>
  </div>
</div>
      `;
    document.body.appendChild(this.container);
    // اضافه کردن event listeners بعد از رندر
  this.addEventListeners();
  }

  async setupEvents() {
    const init=await this.loadConfig();
    this.log(init)
    this.app=init?.data;
  }

  getTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      this.log('Invalid Date object');
      return null;
    }
  
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert 24h format to 12h format
    const formattedHours = hours % 12 || 12; // Handle midnight (0 => 12)
  
    return `${formattedHours}:${minutes} ${period}`;
  }
  async checkAuth() {
    // بررسی وضعیت احراز هویت
  }
  addEventListeners() {
    // دکمه toggle
    this.container.querySelector('.chat-toggle').addEventListener('click', () => {
      this.container.classList.toggle('open');
    });
  
    // دکمه close
    this.container.querySelector('.chat-close-btn').addEventListener('click', () => {
      this.container.classList.toggle('open');
    });
  
    // دکمه ارسال پیام
    this.container.querySelector('.chat-send-btn').addEventListener('click', 
      this.sendMessage.bind(this)
    );
  
    // فیلد ورودی پیام (برای ارسال با Enter)
    this.container.querySelector('#chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }
  async sendMessage() {
    const input = this.container.querySelector('#chat-input');
    const message = input.value.trim();
    this.log('message',message)
    if (!message) return; 
    this.showTypingIndicator();
    try {
      // نمایش پیام کاربر
      this.renderMessage({
        text: message,
        isUser: true,
        timestamp: new Date()
      });
  
      // پاک کردن فیلد ورودی
      input.value = '';
  
      // ارسال به سرور
      const response = await fetch(`${this.apiUrl}/openai/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'site-key': this.config?.siteKey,
          // 'Authorization': `Bearer ${this.user?.token}`
        },
        body: JSON.stringify({msg: message })
      });
  
      const data = await response.json();
      this.log('data',data)
      // نمایش پاسخ
      this.renderMessage({
        text: data.data,
        isUser: false,
        timestamp: new Date()
      });
  
    } catch (error) {
      console.error('Error sending message:', error);
      // نمایش خطا به کاربر
    }
    this.hideTypingIndicator();
  }
  showTypingIndicator() {
    const statusElement = this.container.querySelector('.chat-status');
    if (statusElement) {
      statusElement.style.display = 'flex';
    }
  }
  
  hideTypingIndicator() {
    const statusElement = this.container.querySelector('.chat-status');
    if (statusElement) {
      statusElement.style.display = 'none';
    }
  }
  renderMessage(message) {
    const messagesContainer = this.container.querySelector('.chat-body');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `chat-message ${
      message.isUser ? 'user-message' : 'other-message'
    }`;
    
    messageDiv.innerHTML = `
      ${message.text}
      <span class="message-meta">${this.getTime(message.timestamp)}</span>
    `;
  
    messagesContainer.appendChild(messageDiv);
    
    // اسکرول به آخرین پیام
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
 
  loadConfig() {
    this.log('siteKey',this.config?.siteKey)
   return fetch(`${this.apiUrl}/openai`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'site-key': this.config?.siteKey
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // or response.text() if not JSON
    }).catch(e=>e) ;
  }
}