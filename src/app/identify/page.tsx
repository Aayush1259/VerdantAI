"use client";

import { useState } from 'react';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { identifyPlant } from "@/ai/flows/identify-plant";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function IdentifyPlantPage() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [careTips, setCareTips] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleIdentifyPlant = async () => {
    setLoading(true);
    try {
      const result = await identifyPlant({ photoUrl });
      setCommonName(result.commonName);
      setScientificName(result.scientificName);
      setCareTips(result.careTips);
      toast({
        title: "Plant Identified!",
        description: `Successfully identified the plant as ${result.commonName}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to identify plant.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Identify Plant</h1>
        <p className="text-muted-foreground">Upload an image to identify the plant species.</p>
      </section>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Upload Plant Image</CardTitle>
          <CardDescription>Please provide a URL to your plant image.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <Button onClick={handleIdentifyPlant} disabled={loading}>
            {loading ? "Identifying..." : "Identify Plant"}
          </Button>

          {photoUrl && (
            <div className="relative w-full h-64 rounded-md overflow-hidden">
              <Image
                src={photoUrl}
                alt="Plant Image"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {commonName && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="plant-info">
              <AccordionTrigger>
                <h2 className="text-2xl font-semibold">
                  {commonName} ({scientificName})
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  <strong>Care Tips:</strong> {careTips}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
