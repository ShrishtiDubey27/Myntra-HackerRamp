import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ChatBubble = ({ message }) => {
  const isBotMessage = message.sender === 'bot';

  return (
    <div className={`flex items-end ${isBotMessage ? 'justify-start' : 'justify-end'}`}>
      {isBotMessage && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">B</div>
        </div>
      )}
      <div
        className={`px-5 py-3 rounded-2xl max-w-[75%] break-words ${
          !isBotMessage
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            : message.fallback
              ? 'bg-yellow-100 text-yellow-800 italic'
              : 'bg-gray-200 text-gray-900'
        }`}
      >
        {isBotMessage ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />
            }}
          >
            {message.text}
          </ReactMarkdown>
        ) : (
          <div>{message.text}</div>
        )}
        <div className="text-xs text-gray-500 mt-1 text-right">
          {format(new Date(message.time), 'hh:mm a')}
        </div>
      </div>
      {!isBotMessage && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold">U</div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;