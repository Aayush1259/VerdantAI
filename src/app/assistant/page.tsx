;"use client";

import { useState, useEffect, useRef } from 'react';
import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { askGreenAiAssistant } from "@/ai/flows/green-ai-assistant";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { useRouter } from 'next/navigation';

export default function GreenAIAssistantPage() {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'question' | 'advice'; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
    const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Scroll to bottom when messages are added
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskAssistant = async () => {
    if (question.trim() === '') return;

    const newQuestion = question;
    setQuestion('');
    setChatHistory((prev) => [...prev, { type: 'question', text: newQuestion }]);
    setLoading(true);

    try {
      const result = await askGreenAiAssistant({ question: newQuestion });
      const newAdvice = result.advice;
      setChatHistory((prev) => [...prev, { type: 'advice', text: newAdvice }]);

      toast({
        title: "Advice Received!",
        description: "Check out the personalized advice below.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get advice.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAskAssistant();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-xl font-semibold">Green AI</h1>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.map((item, index) => (
          <div
            key={index}
            className={`mb-2 flex flex-col ${
              item.type === 'question' ? 'items-end' : 'items-start'
            }`}
          >
            {item.type === 'advice' && (
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="text-xs text-gray-500">Green AI</div>
              </div>
            )}
            <div
              className={`rounded-xl px-4 py-2 text-sm max-w-[80%] ${
                item.type === 'question'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {item.text}
            </div>
            {item.type === 'advice' && (
              <div className="text-right text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} /> {/* Scroll anchor */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <Textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about plant care, identification..."
            className="flex-1 resize-none"
          />
          <Button onClick={handleAskAssistant} disabled={loading} className="p-2 rounded-full">
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
        {/* Bottom Navigation */}
        <footer className="fixed bottom-0 left-0 w-full bg-secondary py-2 border-t border-gray-200">
            <nav className="flex justify-around">
                <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/')}>
                    <Icons.home className="h-5 w-5 mb-1" />
                    <span className="text-xs">Home</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/disease')}>
                    <Icons.leaf className="h-5 w-5 mb-1" />
                    <span className="text-xs">Identify</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/garden')}>
                    <Icons.user className="h-5 w-5 mb-1" />
                    <span className="text-xs">Profile</span>
                </Button>
            </nav>
        </footer>
    </div>
  );
}
