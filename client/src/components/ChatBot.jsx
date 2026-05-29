import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api';
import { MessageSquare, X, Send, AlertCircle } from 'lucide-react';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  if (!user) return null;

  useEffect(() => {
    if (messages.length === 0) {
      const isDoctor = user.role === 'doctor';
      const greeting = isDoctor
        ? `Hello Dr. ${user.name}. I am your Clinical Assistant. I can help suggest medicine dosages, draft digital prescriptions, or check drug interaction guidelines. How can I help you today?`
        : `Hello ${user.name}. I am your Patient Guide. I can help explain your active prescriptions, tell you about medicine schedules, side effects, and precautions. What would you like to know?`;
      
      setMessages([{ id: 'greet', sender: 'bot', text: greeting, timestamp: new Date() }]);
    }
  }, [user, messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    
    const userMsgObj = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await chatAPI.sendMessage(userMessage, chatHistory);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err.message || 'Unable to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <li key={index} className="ml-4 list-disc text-xs sm:text-sm text-[var(--color-text-primary)] my-0.5 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={index} className="text-xs sm:text-sm font-semibold text-indigo-400 mt-2 mb-1">
            {parseBoldText(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={index} className="text-sm sm:text-base font-semibold text-indigo-400 mt-3 mb-1">
            {parseBoldText(trimmed.substring(3))}
          </h3>
        );
      }
      
      if (trimmed === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-xs sm:text-sm text-[var(--color-text-primary)] my-1 leading-relaxed">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-indigo-300">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-20 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all duration-300 z-50 cursor-pointer group"
        aria-label="Toggle assistant chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-10 w-[360px] sm:w-[400px] h-[520px] max-h-[calc(100vh-120px)] max-w-[calc(100vw-2rem)] bg-[var(--color-sidebar)] border border-[var(--color-border)] shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 animate-fade-in-down">
          <div className="bg-gradient-to-r from-indigo-950 to-[#171b29] px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Assistant</h3>
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                  {user.role === 'doctor' ? 'Clinical Assistant' : 'Patient Assistant'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--color-page)]/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    m.sender === 'user'
                      ? 'bg-indigo-600/15 border border-indigo-500/25 text-indigo-400'
                      : 'bg-white/5 border border-white/5 text-[var(--color-text-secondary)]'
                  }`}
                >
                  {m.sender === 'user' ? 'U' : 'A'}
                </div>

                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[var(--color-cards)] border border-[var(--color-border)] rounded-tl-none'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <p className="leading-relaxed">{m.text}</p>
                  ) : (
                    <div>{renderMessageText(m.text)}</div>
                  )}
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[var(--color-text-secondary)]">
                  A
                </div>
                <div className="bg-[var(--color-cards)] border border-[var(--color-border)] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-[var(--color-sidebar)] border-t border-[var(--color-border)] flex flex-col gap-2"
          >
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={user.role === 'doctor' ? "Ask about patient history, dosage suggestion..." : "Ask about your medication side effects, dosage..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[var(--color-page)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
