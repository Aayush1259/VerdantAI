"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { identifyPlant } from "@/ai/flows/identify-plant";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function IdentifyPlantPage() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [careTips, setCareTips] = useState('');
  const [detailedAnalysis, setDetailedAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false); // State to toggle camera view
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (useCamera) {
      getCameraPermission();
    }

    return () => {
      // Clean up the video stream when the component unmounts or camera is toggled off
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [useCamera, toast]);

  const handleCaptureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      setPhotoUrl(dataURL);
      setUseCamera(false); // Disable camera after capturing image
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyPlant = async () => {
    setLoading(true);
    try {
      const result = await identifyPlant({ photoUrl });
      setCommonName(result.commonName);
      setScientificName(result.scientificName);
      setCareTips(result.careTips);
      setDetailedAnalysis(result.detailedAnalysis);
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
          <CardDescription>Please provide a URL, use your camera, or select from gallery.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

           <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
              "
          />

          <Button type="button" variant="secondary" onClick={() => setUseCamera(!useCamera)}>
              {useCamera ? "Close Camera" : "Open Camera"}
          </Button>

          {useCamera && hasCameraPermission && (
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
          )}

          {useCamera && !hasCameraPermission && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}

          {useCamera && hasCameraPermission && (
            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={handleCaptureImage} disabled={loading}>
                Capture Image
              </Button>
            </div>
          )}

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

          <Button onClick={handleIdentifyPlant} disabled={loading || !photoUrl}>
            {loading ? "Identifying..." : "Identify Plant"}
          </Button>
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
                <p>
                  <strong>Detailed Analysis:</strong> {detailedAnalysis}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
