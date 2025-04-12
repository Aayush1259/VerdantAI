"use client";

import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { askGreenAiAssistant } from "@/ai/flows/green-ai-assistant";
import { useToast } from "@/hooks/use-toast";

export default function GreenAIAssistantPage() {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAskAssistant = async () => {
    setLoading(true);
    try {
      const result = await askGreenAiAssistant({ question });
      setAdvice(result.advice);
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

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">GreenAI Assistant</h1>
        <p className="text-muted-foreground">Get personalized plant care advice.</p>
      </section>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Ask Your Question</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Textarea
            placeholder="Enter your plant care question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button onClick={handleAskAssistant} disabled={loading}>
            {loading ? "Getting Advice..." : "Get Advice"}
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{advice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

