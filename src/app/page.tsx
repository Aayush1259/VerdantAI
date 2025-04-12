import Image from 'next/image';
import Link from 'next/link';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Icons} from '@/components/icons';
import { useSession, signIn, signOut } from "next-auth/react"

const features = [
  {
    title: 'Plant Identification',
    description: 'Identify plant species from an image.',
    href: '/identify',
    icon: Icons.leaf,
  },
  {
    title: 'Disease Detection',
    description: 'Detect plant diseases from an image.',
    href: '/disease',
    icon: Icons.shield,
  },
  {
    title: 'My Garden',
    description: 'Track care information and set reminders for your plants.',
    href: '/garden',
    icon: Icons.home,
  },
  {
    title: 'GreenAI Assistant',
    description: 'Get personalized advice and suggestions for plant care.',
    href: '/assistant',
    icon: Icons.help,
  },
];

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">Welcome to VerdantAI</h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered companion for plant care.
        </p>
        {session ? (
          <div className='flex flex-row gap-4 pt-4 items-center justify-center'>
            <p>Signed in as {session?.user?.email}</p>
            <Button onClick={() => signOut()}>Sign out</Button>
          </div>
        ) : (
          <Button onClick={() => signIn()}>Sign in</Button>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="hover:shadow-md transition-shadow duration-300 ease-in-out">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {<feature.icon className="mr-2 h-5 w-5"/>}
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
