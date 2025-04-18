"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Leaf, Camera, ArrowLeft } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { identifyPlant } from "@/ai/flows/identify-plant";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';
import { Home, Shield, ImagePlus } from 'lucide-react';
import { Icons } from '@/components/icons';
import React from 'react';

const sampleImages = [
  'https://picsum.photos/200/300',
  'https://picsum.photos/200/301',
  'https://picsum.photos/200/302',
];

export default function IdentifyPlantPage() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [careTips, setCareTips] = useState('');
  const [detailedAnalysis, setDetailedAnalysis] = useState('');
  const [growthHabit, setGrowthHabit] = useState('');
  const [lifespan, setLifespan] = useState('');
  const [lightRequirements, setLightRequirements] = useState('');
  const [waterRequirements, setWaterRequirements] = useState('');
  const [soilPreferences, setSoilPreferences] = useState('');
  const [suitableLocations, setSuitableLocations] = useState('');
  const [potentialProblems, setPotentialProblems] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false); // State to toggle camera view
  const { toast } = useToast();
  const router = useRouter();

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
      setGrowthHabit(result.growthHabit || '');
      setLifespan(result.lifespan || '');
      setLightRequirements(result.lightRequirements || '');
      setWaterRequirements(result.waterRequirements || '');
      setSoilPreferences(result.soilPreferences || '');
      setSuitableLocations(result.suitableLocations || '');
      setPotentialProblems(result.potentialProblems || '');
      toast({
        title: "Plant Identified!",
        description: `Successfully identified the plant as ${result.commonName}.`,
      });
    }
    catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to identify plant.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleImageClick = (imageUrl: string) => {
    setPhotoUrl(imageUrl);
  };

  return (
    <div className="container mx-auto py-10">
      {/* Back Navigation */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Plant Identification
      </Button>
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2"></h1>
        <p className="text-muted-foreground">Upload an image to identify the plant species.</p>
      </section>

      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-4 space-y-4">
          {/* Image Upload Preview */}
          {!photoUrl && (
            <div className="relative w-full h-64 rounded-md overflow-hidden flex items-center justify-center bg-secondary">
              {Icons.image ? (
                <Icons.image className="h-12 w-12 text-muted-foreground" />
              ) : (
                <p className="text-sm text-muted-foreground">Image Icon Missing</p>
              )}
              <p className="text-sm text-muted-foreground">Upload a photo to identify</p>
            </div>
          )}

          {photoUrl && (
            <div className="relative w-full h-64 rounded-md overflow-hidden">
              <Image
                src={photoUrl}
                alt="Plant Image"
                layout="fill"
                objectFit="contain"
                width={500}
                height={500}
              />
            </div>
          )}
          <div className="flex justify-around space-x-2">
            <Button type="button" variant="secondary" onClick={() => setUseCamera(!useCamera)}>
              {useCamera ? "Close Camera" : "Take Photo"}
              <Camera className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="identify-image-upload"
              />
              <label htmlFor="identify-image-upload">
                <Button type="button" variant="outline">
                  Choose from Gallery
                  <ImagePlus className="ml-2 h-4 w-4" />
                </Button>
              </label>
            </div>
          </div>


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
          {/* Sample Images */}
          <div>
            <p className="text-center text-sm text-muted-foreground mt-4">Or pick a sample image:</p>
            <div className="flex justify-center space-x-2 mt-2">
              {sampleImages.map((imageUrl, index) => (
                <Image
                  key={index}
                  src={imageUrl}
                  alt={`Sample Plant ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-md cursor-pointer"
                  onClick={() => handleSampleImageClick(imageUrl)}
                  priority={true}
                />
              ))}
            </div>
          </div>


          <Button onClick={handleIdentifyPlant} disabled={loading || !photoUrl}>
            {loading ? "Identifying..." : "Identify Plant"}
          </Button>
        </CardContent>
      </Card>

      {commonName && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-green-500" />
                {commonName} ({scientificName})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-xl font-semibold mb-2">Care Tips</h3>
                <p>{careTips}</p>
              </section>

              <Accordion type="single" collapsible>
                {detailedAnalysis && (
                  <AccordionItem value="analysis">
                    <AccordionTrigger className="text-xl font-semibold">Detailed Analysis</AccordionTrigger>
                    <AccordionContent>
                      <p>{detailedAnalysis}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {growthHabit && (
                  <AccordionItem value="growth">
                    <AccordionTrigger className="text-lg font-semibold">Growth Habit</AccordionTrigger>
                    <AccordionContent>
                      <p>{growthHabit}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {lifespan && (
                  <AccordionItem value="lifespan">
                    <AccordionTrigger className="text-lg font-semibold">Lifespan</AccordionTrigger>
                    <AccordionContent>
                      <p>{lifespan}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {lightRequirements && (
                  <AccordionItem value="light">
                    <AccordionTrigger className="text-lg font-semibold">Light Requirements</AccordionTrigger>
                    <AccordionContent>
                      <p>{lightRequirements}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {waterRequirements && (
                  <AccordionItem value="water">
                    <AccordionTrigger className="text-lg font-semibold">Water Requirements</AccordionTrigger>
                    <AccordionContent>
                      <p>{waterRequirements}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {soilPreferences && (
                  <AccordionItem value="soil">
                    <AccordionTrigger className="text-lg font-semibold">Soil Preferences</AccordionTrigger>
                    <AccordionContent>
                      <p>{soilPreferences}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {suitableLocations && (
                  <AccordionItem value="locations">
                    <AccordionTrigger className="text-lg font-semibold">Suitable Locations</AccordionTrigger>
                    <AccordionContent>
                      <p>{suitableLocations}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {potentialProblems && (
                  <AccordionItem value="problems">
                    <AccordionTrigger className="text-lg font-semibold">Potential Problems</AccordionTrigger>
                    <AccordionContent>
                      <p>{potentialProblems}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-secondary py-2 border-t border-gray-200">
        <nav className="flex justify-around">
          <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/')}>
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/assistant')}>
            <Icons.help className="h-5 w-5 mb-1" />
            <span className="text-xs">Green AI</span>
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
