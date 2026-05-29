import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api';
import { Send, User as UserIcon, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

const ChatAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const isDoctor = user?.role === 'doctor';

  const suggestions = isDoctor
    ? [
        { label: 'Suggest typical Amoxicillin dosage', query: 'Recommend a standard dosage of Amoxicillin for an adult with a respiratory tract infection.' },
        { label: 'Draft prescription template', query: 'Write a prescription draft for a patient diagnosed with acute bronchitis (with medicine names, frequency, and duration).' },
        { label: 'Summarize patient clinical metrics', query: 'List out the details of all patients currently in my database and check the prescription counts.' },
        { label: 'Check drug-drug interactions', query: 'Check if there are any known interactions or precautions when prescribing Ibuprofen alongside standard blood thinners.' }
      ]
    : [
        { label: 'Explain my prescription', query: 'Explain my active prescriptions and summarize what medications I need to take.' },
        { label: 'Ask about side effects', query: 'What are the common side effects and precautions of the medicines in my active prescription?' },
        { label: 'How should I store medicines?', query: 'What are the general rules for storing and taking medications safely (before/after meals)?' },
        { label: 'Ask about follow-ups', query: 'What should I do if my symptoms do not improve after completing the course?' }
      ];

  useEffect(() => {
    if (messages.length === 0 && user) {
      const greeting = isDoctor
        ? `Hello Dr. ${user.name}. I am your Clinical Assistant. You can ask me to draft digital prescriptions, lookup typical drug dosages, summarize patient stats, or verify medication guidelines. How can I help you today?`
        : `Hello ${user.name}. I am your Patient Guide. I can explain your prescriptions, describe medicine side effects, explain precautions, and answer common health questions. What would you like to discuss?`;
      
      setMessages([{ id: 'greet', sender: 'bot', text: greeting, timestamp: new Date() }]);
    }
  }, [user, messages, isDoctor]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    if (!messageText.trim() || loading) return;

    const userMsgObj = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setLoading(true);
    setError('');

    try {
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await chatAPI.sendMessage(messageText, chatHistory);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err.message || 'Unable to connect to AI Service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSend(input);
    setInput('');
  };

  const handleSuggestionClick = (query) => {
    handleSend(query);
  };

  const renderMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={index} className="ml-5 list-disc text-sm text-slate-300 my-1 leading-relaxed">
            {parseBoldText(trimmed.substring(2))}
          </li>
        );
      }
      
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-semibold text-indigo-400 mt-3 mb-1.5">
            {parseBoldText(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={index} className="text-base font-semibold text-indigo-400 mt-4 mb-2">
            {parseBoldText(trimmed.substring(3))}
          </h3>
        );
      }
      
      if (trimmed === '') {
        return <div key={index} className="h-2.5" />;
      }

      return (
        <p key={index} className="text-sm text-slate-300 my-1.5 leading-relaxed">
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
    <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 pb-10 h-[calc(100vh-140px)]">
      <div className="w-full md:w-[280px] lg:w-[320px] flex flex-col gap-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {isDoctor 
              ? 'Your clinical assistant, connected to prescription trends, medication aggregates, and your active roster.' 
              : 'Your medication advisor. Explain prescriptions, dosage timetables, side effects, and storage guidelines.'}
          </p>
        </div>

        <div className="bg-[var(--color-sidebar)] rounded-2xl p-4 border border-[var(--color-border)] shadow-md flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            Quick Prompts
          </h3>
          <div className="flex flex-col gap-2.5 mt-1">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s.query)}
                disabled={loading}
                className="text-left text-xs bg-[var(--color-page)] hover:bg-[var(--color-border)] border border-[var(--color-border)] hover:border-white/10 text-slate-300 hover:text-white p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium pr-2">{s.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[var(--color-sidebar)] border border-[var(--color-border)] rounded-3xl shadow-xl flex flex-col overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-gradient-to-r from-indigo-950/30 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Assistant</h2>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wide mt-0.5 block">
                {isDoctor ? 'Clinical Assistant' : 'Patient Companion'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[var(--color-page)]/10">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
                    : 'bg-white/5 border border-white/5 text-slate-400'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <span className="font-bold text-indigo-400 text-xs">A</span>}
              </div>

              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[var(--color-cards)] border border-[var(--color-border)] rounded-tl-none'
                }`}
              >
                {m.sender === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                ) : (
                  <div>{renderMessageText(m.text)}</div>
                )}
                <span
                  className={`block text-[9px] mt-2 text-right ${
                    m.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                <span className="font-bold text-indigo-400 text-xs">A</span>
              </div>
              <div className="bg-[var(--color-cards)] border border-[var(--color-border)] px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-4 text-sm max-w-xl mx-auto shadow-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-xs uppercase tracking-wider mb-0.5">Error</span>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="p-4 bg-[var(--color-sidebar)] border-t border-[var(--color-border)] flex flex-col gap-2.5"
        >
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder={
                isDoctor 
                  ? "Write patient guidelines, ask dosage recommendations..." 
                  : "Type side effect questions, storage details..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[var(--color-page)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-slate-500 outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
