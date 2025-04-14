"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Home, Leaf, Shield, Bell } from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Icons} from '@/components/icons';
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const features = [
  {
    title: 'Plant Identification',
    description: 'Identify plant species from an image.',
    href: '/identify',
    icon: Camera,
  },
  {
    title: 'Disease Detection',
    description: 'Detect plant diseases from an image.',
    href: '/disease',
    icon: Shield,
  },
    {
        title: 'Green Community',
        description: 'Connect with other plant enthusiasts.',
        href: '/community',
        icon: Icons.messageSquare, // Using message square icon
    },
  {
    title: 'My Garden',
    description: 'Track care information and set reminders for your plants.',
    href: '/garden',
    icon: Home,
  },
];

const images = [
    "https://picsum.photos/id/237/400/300",
    "https://picsum.photos/id/238/400/300",
    "https://picsum.photos/id/239/400/300",
    "https://picsum.photos/id/240/400/300",
    "https://picsum.photos/id/241/400/300",
];

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter();
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">VerdantAI</h1>
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
      </header>

      {/* Image Slider */}
      <section className="relative h-48 mb-4 rounded-lg overflow-hidden">
            <Image
                src={images[currentImage]}
                alt="Plant Image"
                layout="fill"
                objectFit="cover"
                className="transition-opacity duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-semibold">Welcome to Plant Care</h2>
                <p className="text-sm text-center">Your smart companion for plant identification and care.</p>
            </div>
        </section>

      {/* Features */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Features</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="transition-shadow duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center h-10">
                    <feature.icon className="mr-2 h-5 w-5 text-green-500"/>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

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

          {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
                      <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuItem onClick={() => router.push('/garden')}>My Garden</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/garden')}>
              <Icons.user className="h-5 w-5 mb-1" />
              <span className="text-xs">Profile</span>
            </Button>
          )}
        </nav>
      </footer>
    </div>
  );
}

