'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Mic, X, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useCartAdd } from '@/components/use-cart-add';
import { SearchResult } from '@/lib/search/schema';

const getSpeechRecognition = () => {
 if (typeof window === 'undefined') return null;
 const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
 return SpeechRecognition ? new SpeechRecognition() : null;
};

const processedToolCalls = new Set<string>();

export function FloatingAiWidget() {
 const [isOpen, setIsOpen] = useState(false);
 const [isListening, setIsListening] = useState(false);
 const [input, setInput] = useState('');
 const recognitionRef = useRef<any>(null);
 const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
 const { addDish, CartWarningModal } = useCartAdd();

 const { messages, sendMessage, status } = useChat({
 transport: new DefaultChatTransport({ api: '/api/ai-chat' }),
 });

 const isLoading = status === 'streaming' || status === 'submitted';

 // Watch for tool invocations returning results
 useEffect(() => {
 const lastMessage = messages[messages.length - 1];
 if (lastMessage?.role === 'assistant' && lastMessage.parts) {
 lastMessage.parts.forEach((part: any) => {
 if (part.type === 'tool-invocation' && part.toolInvocation.state === 'result') {
 const result = part.toolInvocation.result;
 if (part.toolInvocation.toolName === 'addToCart' && result && result.dish) {
 const dish = result.dish as SearchResult;
 const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
 
 // Note: Since this is useEffect, we might call this multiple times if we don't track it.
 // Let's add a local state to track processed tool calls to avoid double-adding.
 const key = part.toolInvocation.toolCallId;
 if (!processedToolCalls.has(key)) {
 processedToolCalls.add(key);
 addDish({
 dishId: dish.id,
 name: dish.name,
 restaurantName: dish.restaurantName,
 stallName: dish.stallName,
 stallId,
 price: dish.price,
 quantity: 1,
 customizations: result.customizations,
 });
 }
 }
 }
 });
 }
 }, [messages, addDish]);

 const startListening = useCallback(() => {
 try {
 if (!recognitionRef.current) {
 recognitionRef.current = getSpeechRecognition();
 if (recognitionRef.current) {
 recognitionRef.current.continuous = false;
 recognitionRef.current.interimResults = true;
 
 recognitionRef.current.onresult = (event: any) => {
 const transcript = Array.from(event.results)
 .map((result: any) => result[0])
 .map((result: any) => result.transcript)
 .join('');
 setInput(transcript);
 };
 
 recognitionRef.current.onend = () => {
 setIsListening(false);
 };
 }
 }
 
 if (recognitionRef.current) {
 recognitionRef.current.start();
 setIsListening(true);
 setIsOpen(true);
 } else {
 alert("Speech recognition is not supported in this browser.");
 }
 } catch (e) {
 console.error(e);
 setIsListening(false);
 }
 }, []);

 const stopListening = useCallback(() => {
 if (recognitionRef.current && isListening) {
 recognitionRef.current.stop();
 setIsListening(false);
 if (input.trim()) {
 sendMessage({ text: input });
 setInput('');
 }
 }
 }, [isListening, input, sendMessage]);

 const handlePointerDown = (e: React.PointerEvent) => {
 if (isOpen) return;
 holdTimeoutRef.current = setTimeout(() => {
 startListening();
 }, 500);
 };

 const handlePointerUp = (e: React.PointerEvent) => {
 if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
 if (isListening) {
 stopListening();
 }
 };

 const handleClick = () => {
 if (!isListening) {
 setIsOpen((prev) => !prev);
 }
 };

 const onSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (input.trim()) {
 sendMessage({ text: input });
 setInput('');
 }
 };

 return (
 <>
 <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2">
 {isListening && (
 <div className="absolute -top-12 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
 Listening...
 </div>
 )}
 
 <button
 onPointerDown={handlePointerDown}
 onPointerUp={handlePointerUp}
 onPointerLeave={handlePointerUp}
 onClick={handleClick}
 className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transform ${isListening ? 'bg-red-500 scale-110 shadow-red-500/50' : 'bg-black hover:bg-neutral-800 hover:scale-105'}`}
 >
 {isListening ? (
 <Mic className="h-6 w-6 " />
 ) : isOpen ? (
 <X className="h-6 w-6" />
 ) : (
 <MessageSquare className="h-6 w-6" />
 )}
 </button>
 </div>

 {isOpen && (
 <div className="fixed bottom-40 right-4 w-[calc(100vw-2rem)] max-w-sm sm:w-[350px] z-50 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
 <div className="bg-black text-white px-5 py-4 flex items-center justify-between">
 <h3 className="font-bold text-sm">Hawker AI</h3>
 <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white ">
 <X className="h-5 w-5" />
 </button>
 </div>
 
 <div className="flex-1 p-5 overflow-y-auto max-h-[40vh] min-h-[250px] flex flex-col gap-4 bg-neutral-50/50">
 {messages.length === 0 && (
 <div className="m-auto text-center text-sm text-neutral-500">
 <p>Hi! I can help you find and order food.</p>
 <p className="mt-2 text-xs">Try saying:<br/>"I want pan mee extra spice"</p>
 </div>
 )}
 
 {messages.map(m => (
 <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black shadow-sm'}`}>
 {m.parts?.map((part: any, i: number) => {
 if (part.type === 'text') {
 return <span key={i}>{part.text}</span>;
 }
 if (part.type === 'tool-invocation') {
 return (
 <div key={i} className="mt-2 text-xs text-green-600 font-medium">
 {part.toolInvocation.toolName === 'addToCart' && part.toolInvocation.state === 'result' ? '✓ Added to cart!' : 'Working...'}
 </div>
 );
 }
 return null;
 })}
 </div>
 </div>
 ))}
 {isLoading && (
 <div className="flex justify-start">
 <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
 <Loader2 className="h-4 w-4 text-neutral-400" />
 </div>
 </div>
 )}
 </div>
 
 <div className="p-3 bg-white">
 <form onSubmit={onSubmit} className="flex gap-2">
 <div className="relative flex-1">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Ask for food..."
 className="w-full h-11 pl-4 pr-10 bg-neutral-100 rounded-full text-sm outline-none focus:bg-neutral-200 "
 />
 <button
 type="button"
 onClick={startListening}
 className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-neutral-500 hover:text-black "
 >
 <Mic className="h-4 w-4" />
 </button>
 </div>
 <button 
 type="submit"
 disabled={!input.trim()}
 className="h-11 w-11 flex items-center justify-center bg-black text-white rounded-full shrink-0 disabled:opacity-50 disabled:bg-neutral-300 "
 >
 <Send className="h-4 w-4" />
 </button>
 </form>
 </div>
 </div>
 )}
 
 <CartWarningModal />
 </>
 );
}
