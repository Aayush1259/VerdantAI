"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Leaf, Shield, Camera } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { detectPlantDisease } from "@/ai/flows/detect-plant-disease";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';
import { Home, ShieldCheck, ImagePlus } from 'lucide-react';
import { Icons } from '@/components/icons';
import React from 'react';

const sampleImages = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/301',
    'https://picsum.photos/200/302',
];

export default function DiseaseDetectionPage() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [detectedPlant, setDetectedPlant] = useState('');
  const [quickSummary, setQuickSummary] = useState('');
  const [plantCondition, setPlantCondition] = useState('');
  const [likelyCauses, setLikelyCauses] = useState('');
  const [recommendedActions, setRecommendedActions] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [preventionGuide, setPreventionGuide] = useState('');
  const [additionalTips, setAdditionalTips] = useState('');
  const [ecosystemImpact, setEcosystemImpact] = useState('');
  const [basicDiseaseInformation, setBasicDiseaseInformation] = useState('');
  const [detailedCareInstructions, setDetailedCareInstructions] = useState('');
  const [diseaseDetected, setDiseaseDetected] = useState(false);
  const [diseaseName, setDiseaseName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [causes, setCauses] = useState('');
  const [treatments, setTreatments] = useState('');
  const [prevention, setPrevention] = useState('');
  const [fertilizerRecommendation, setFertilizerRecommendation] = useState(''); // New state for fertilizer recommendation
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


  const handleDetectDisease = async () => {
    setLoading(true);
    try {
      const result = await detectPlantDisease({ photoUrl });
      setDetectedPlant(result.detectedPlant || '');
      setQuickSummary(result.quickSummary || '');
      setPlantCondition(result.plantCondition || '');
      setLikelyCauses(result.likelyCauses || '');
      setRecommendedActions(result.recommendedActions || '');
      setCareInstructions(result.careInstructions || '');
      setPreventionGuide(result.preventionGuide || '');
      setAdditionalTips(result.additionalTips || '');
      setEcosystemImpact(result.ecosystemImpact || '');
      setBasicDiseaseInformation(result.basicDiseaseInformation || '');
      setDetailedCareInstructions(result.detailedCareInstructions || '');
      setDiseaseDetected(result.diseaseDetected);
      setDiseaseName(result.diseaseName || '');
      setSymptoms(result.symptoms || '');
      setCauses(result.causes || '');
      setTreatments(result.treatments || '');
      setPrevention(result.prevention || '');
      setFertilizerRecommendation(result.fertilizerRecommendation || ''); // Retrieve fertilizer recommendation
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

    const handleSampleImageClick = (imageUrl: string) => {
        setPhotoUrl(imageUrl);
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
          <CardDescription>You can provide a URL, use your camera, or select from gallery.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
           {/* Image Upload Preview */}
           {!photoUrl && (
            <div className="relative w-full h-64 rounded-md overflow-hidden flex items-center justify-center bg-secondary">
              {Icons.image ? (
                  <Icons.image className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <p className="text-sm text-muted-foreground">Image Icon Missing</p>
                )}
              <p className="text-sm text-muted-foreground">Upload a photo to detect the plant disease</p>
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

                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="disease-image-upload"
                />
               <label htmlFor="disease-image-upload">
                  <Button type="button" variant="outline">
                    Choose from Gallery
                    <ImagePlus className="ml-2 h-4 w-4" />
                  </Button>
                </label>
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
                        />
                    ))}
                </div>
            </div>

          <Button onClick={handleDetectDisease} disabled={loading || !photoUrl}>
            {loading ? "Detecting..." : "Detect Disease"}
          </Button>
        </CardContent>
      </Card>

      {diseaseDetected && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-red-500" />
                Plant Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detectedPlant && (
                <section>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Leaf className="mr-2 h-5 w-5 text-green-500" />
                    Detected Plant
                  </h3>
                  <p>{detectedPlant}</p>
                </section>
              )}

              {quickSummary && (
                <section>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-yellow-500" />
                    Quick Summary
                  </h3>
                  <p>{quickSummary}</p>
                </section>
              )}

              <Accordion type="single" collapsible>
                {plantCondition && (
                  <AccordionItem value="condition">
                    <AccordionTrigger className="text-xl font-semibold">Plant Condition</AccordionTrigger>
                    <AccordionContent>
                      <p>{plantCondition}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {likelyCauses && (
                  <AccordionItem value="causes">
                    <AccordionTrigger className="text-xl font-semibold">Likely Causes</AccordionTrigger>
                    <AccordionContent>
                      <p>{likelyCauses}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {recommendedActions && (
                  <AccordionItem value="actions">
                    <AccordionTrigger className="text-xl font-semibold">Recommended Actions</AccordionTrigger>
                    <AccordionContent>
                      <p>{recommendedActions}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {careInstructions && (
                  <AccordionItem value="instructions">
                    <AccordionTrigger className="text-xl font-semibold">Care Instructions</AccordionTrigger>
                    <AccordionContent>
                      <p>{careInstructions}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {preventionGuide && (
                  <AccordionItem value="prevention">
                    <AccordionTrigger className="text-xl font-semibold">Prevention Guide</AccordionTrigger>
                    <AccordionContent>
                      <p>{preventionGuide}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {additionalTips && (
                  <AccordionItem value="additional">
                    <AccordionTrigger className="text-xl font-semibold">Additional Tips</AccordionTrigger>
                    <AccordionContent>
                      <p>{additionalTips}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {ecosystemImpact && (
                  <AccordionItem value="ecosystem">
                    <AccordionTrigger className="text-xl font-semibold">Ecosystem Impact</AccordionTrigger>
                    <AccordionContent>
                      <p>{ecosystemImpact}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {basicDiseaseInformation && (
                  <AccordionItem value="diseaseinfo">
                    <AccordionTrigger className="text-xl font-semibold">Basic Disease Information</AccordionTrigger>
                    <AccordionContent>
                      <p>{basicDiseaseInformation}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {detailedCareInstructions && (
                  <AccordionItem value="detailedcare">
                    <AccordionTrigger className="text-xl font-semibold">Detailed Care Instructions</AccordionTrigger>
                    <AccordionContent>
                      <p>{detailedCareInstructions}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              {diseaseName && (
                <section>
                  <h3 className="text-xl font-semibold mb-2">Disease Details</h3>
                  {diseaseName && <p><strong>Disease Name:</strong> {diseaseName}</p>}
                  {symptoms && <p><strong>Symptoms:</strong> {symptoms}</p>}
                  {causes && <p><strong>Causes:</strong> {causes}</p>}
                  {treatments && <p><strong>Treatments:</strong> {treatments}</p>}
                  {prevention && <p><strong>Prevention:</strong> {prevention}</p>}
                </section>
              )}

              {fertilizerRecommendation && (
                <section>
                  <h3 className="text-xl font-semibold mb-2">Fertilizer Recommendation</h3>
                  <p>{fertilizerRecommendation}</p>
                </section>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {diseaseDetected === false && (
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <p>No disease detected in the provided image.</p>
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
