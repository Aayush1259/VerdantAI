"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { detectPlantDisease } from "@/ai/flows/detect-plant-disease";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DiseaseDetectionPage() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [diseaseDetected, setDiseaseDetected] = useState(false);
  const [diseaseName, setDiseaseName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [causes, setCauses] = useState('');
  const [treatments, setTreatments] = useState('');
  const [prevention, setPrevention] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
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

    getCameraPermission();
  }, []);


  const handleCaptureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      setPhotoUrl(dataURL);
    }
  };


  const handleDetectDisease = async () => {
    setLoading(true);
    try {
      const result = await detectPlantDisease({ photoUrl });
      setDiseaseDetected(result.diseaseDetected);
      setDiseaseName(result.diseaseName || '');
      setSymptoms(result.symptoms || '');
      setCauses(result.causes || '');
      setTreatments(result.treatments || '');
      setPrevention(result.prevention || '');
      toast({
        title: "Disease Detection Result",
        description: result.diseaseDetected ? `Disease detected: ${result.diseaseName}` : "No disease detected.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to detect disease.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Plant Disease Detection</h1>
        <p className="text-muted-foreground">Upload an image to detect potential diseases in your plant.</p>
      </section>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Upload Plant Image</CardTitle>
          <CardDescription>You can provide a URL or use your camera.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />

          { !(hasCameraPermission) && (
              <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access to use this feature.
                        </AlertDescription>
                </Alert>
          )
          }

          <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleCaptureImage} disabled={loading || !hasCameraPermission}>
                Capture Image
              </Button>
              <Button onClick={handleDetectDisease} disabled={loading}>
                {loading ? "Detecting..." : "Detect Disease"}
              </Button>
            </div>


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

      {diseaseDetected && diseaseName && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="disease-info">
              <AccordionTrigger>
                <h2 className="text-2xl font-semibold">
                  {diseaseName}
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <p><strong>Symptoms:</strong> {symptoms}</p>
                <p><strong>Causes:</strong> {causes}</p>
                <p><strong>Treatments:</strong> {treatments}</p>
                <p><strong>Prevention:</strong> {prevention}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {diseaseDetected === false && (
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <p>No disease detected in the provided image.</p>
        </div>
      )}
    </div>
  );
}
