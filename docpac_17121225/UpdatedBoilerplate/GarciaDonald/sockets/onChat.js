// onChat.js - Handles chat messages and magical spells

// DOM Event Listeners for chat functionality
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const customSpellForm = document.getElementById('custom-spell-form');
    
    // Message form handler
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (message && currentRoom) {
            sendChatMessage(message);
            messageInput.value = '';
        }
    });
    
    // Custom spell form handler
    customSpellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const spellName = document.getElementById('spell-name-input').value.trim();
        const spellEffect = document.getElementById('spell-effect-input').value.trim();
        
        if (spellName && spellEffect && currentRoom) {
            sendMagicSpell(spellName, spellEffect);
            document.getElementById('spell-name-input').value = '';
            document.getElementById('spell-effect-input').value = '';
        }
    });
});

// Chat message functions
function sendChatMessage(message) {
    console.log(`💬 Sending message: ${message}`);
    
    socket.emit('chat-message', {
        message: message
    });
    
    messagesSent++;
    updateStats();
}

// Magical spell functions
function sendMagicSpell(spellName, spellEffect) {
    console.log(`🪄 Casting spell: ${spellName} - ${spellEffect}`);
    
    if (currentRoom) {
        socket.emit('custom-event', {
            eventType: spellName,
            eventData: spellEffect
        });
        
        spellsCast++;
        updateStats();
    }
}

// Pre-defined magical spells
const magicalSpells = {
    wave: '👋 Waves hello',
    sparkles: '✨ Casts sparkles',
    celebration: '🎉 Celebrates',
    'magic-wand': '🪄 Waves magic wand',
    'crystal-ball': '🔮 Gazes into crystal ball',
    lightning: '⚡ Summons lightning'
};

// Quick spell casting (used by the magic buttons)
function castQuickSpell(spellType) {
    if (magicalSpells[spellType] && currentRoom) {
        sendMagicSpell(spellType, magicalSpells[spellType]);
    }
}

// Message display function
function addMagicalMessage(type, message, timestamp) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.style.margin = '8px 0';
    messageDiv.style.padding = '12px';
    messageDiv.style.borderRadius = '15px';
    messageDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    messageDiv.style.animation = 'magicAppear 0.5s ease-out';
    
    switch(type) {
        case 'system':
            messageDiv.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
            messageDiv.style.color = 'white';
            break;
        case 'own':
            messageDiv.style.background = 'linear-gradient(45deg, #56ab2f, #a8e6cf)';
            messageDiv.style.color = '#333';
            break;
        case 'other':
            messageDiv.style.background = 'linear-gradient(45deg, #ff9a9e, #fecfef)';
            messageDiv.style.color = '#333';
            break;
        case 'spell':
            messageDiv.style.background = 'linear-gradient(45deg, #a8edea, #fed6e3)';
            messageDiv.style.color = '#333';
            messageDiv.style.border = '2px solid #6f42c1';
            break;
    }
    
    messageDiv.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Message filtering and moderation
function filterMessage(message) {
    // Basic message filtering (you can expand this)
    const forbiddenWords = ['spam', 'hack', 'cheat'];
    let filteredMessage = message;
    
    forbiddenWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredMessage = filteredMessage.replace(regex, '***');
    });
    
    return filteredMessage;
}
