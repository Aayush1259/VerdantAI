"use client";

import {useState, useEffect} from 'react';
import {useSession, signIn, signOut} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { app } from '@/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, Leaf, User, HelpCircle } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function MyGardenPage() {
  const {data: session, status} = useSession();
  const [plants, setPlants] = useState<any[]>([]);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantSpecies, setNewPlantSpecies] = useState('');
  const [newPlantImage, setNewPlantImage] = useState<File | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
    const router = useRouter();

  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    if (app) {
        setAuth(getAuth(app));
        setDb(getFirestore(app));
        setStorage(getStorage(app));
    }
  }, []);

  useEffect(() => {
    const loadPlants = async () => {
      if (session?.user?.email && db) {
        setLoading(true);
        try {
          const plantsCollection = query(
            collection(db, 'users', session.user.email, 'plants'),
            orderBy('name')
          );
          const plantSnapshot = await getDocs(plantsCollection);
          const plantList = plantSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          setPlants(plantList);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load plants.',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    const loadReminders = async () => {
      if (session?.user?.email && db) {
        setLoading(true);
        try {
          const remindersCollection = query(
            collection(db, 'users', session.user.email, 'reminders'),
            orderBy('text')
          );
          const reminderSnapshot = await getDocs(remindersCollection);
          const reminderList = reminderSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          setReminders(reminderList);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load reminders.',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadPlants();
    loadReminders();
  }, [session, db, toast]);

  const addPlant = async () => {
    if (!db || !storage || !auth) return;
    if (newPlantName.trim() === '' || newPlantSpecies.trim() === '') return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (newPlantImage) {
        const storageRef = ref(storage, `plantImages/${newPlantImage.name}`);
        await uploadBytes(storageRef, newPlantImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'users', session!.user!.email!, 'plants'), {
        name: newPlantName,
        species: newPlantSpecies,
        imageUrl: imageUrl,
      });
      setNewPlantName('');
      setNewPlantSpecies('');
      setNewPlantImage(null);
      toast({
        title: 'Plant Added!',
        description: 'Your plant has been successfully added.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add plant.',
      });
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async () => {
    if (!db || !auth) return;
    if (newReminder.trim() !== '') {
      setLoading(true);
      try {
        const remindersCollection = collection(db, 'users', session!.user!.email!, 'reminders');
        await addDoc(remindersCollection, {text: newReminder});
        setNewReminder('');
        toast({
          title: 'Reminder Added!',
          description: 'Your reminder has been successfully added.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to add reminder.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const deletePlant = async (plantId: string) => {
    if (!db || !auth) return;
    setLoading(true);
    try {
      const plantDoc = doc(db, 'users', session!.user!.email!, 'plants', plantId);
      await deleteDoc(plantDoc);
      setPlants(plants.filter(plant => plant.id !== plantId));
      toast({
        title: 'Plant Deleted!',
        description: 'Your plant has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete plant.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!db || !auth) return;
    setLoading(true);
    try {
      const reminderDoc = doc(db, 'users', session!.user!.email!, 'reminders', reminderId);
      await deleteDoc(reminderDoc);
      setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      toast({
        title: 'Reminder Deleted!',
        description: 'Your reminder has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete reminder.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!auth) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Sign Up Successful!',
        description: 'You have successfully signed up. Please sign in.',
      });
      setIsSignUp(false); // Switch to sign in mode after successful sign up
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
        if (!auth) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Sign In Successful!',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPlantImage(file);
    }
  };

  if (status === 'loading') {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (session) {
    return (
      <div className="container mx-auto py-10">
        <section className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">My Garden</h1>
          <p className="text-muted-foreground">Manage your plants and set reminders.</p>
        </section>

        <Card className="w-full max-w-lg mx-auto mb-8">
          <CardHeader>
            <CardTitle>Add Plant</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <Input
                type="text"
                placeholder="Plant Name"
                value={newPlantName}
                onChange={e => setNewPlantName(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Input
                type="text"
                placeholder="Plant Species"
                value={newPlantSpecies}
                onChange={e => setNewPlantSpecies(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={addPlant} disabled={loading}>
                Add Plant
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg mx-auto mb-8">
          <CardHeader>
            <CardTitle>Add Reminder</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a reminder"
                value={newReminder}
                onChange={e => setNewReminder(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={addReminder} disabled={loading}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>My Plants</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {plants.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plants.map(plant => (
                  <li
                    key={plant.id}
                    className="flex flex-col items-center py-2 border rounded-md p-3 last:border-b-0"
                  >
                    {plant.imageUrl && (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden mb-2">
                        <Image
                          src={plant.imageUrl}
                          alt={plant.name}
                          layout="fill"
                          objectFit="cover"
                          width={128}
                          height={128}
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-semibold">{plant.name}</div>
                      <div className="text-sm text-muted-foreground">{plant.species}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => deletePlant(plant.id)} className="mt-2">
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No plants in your garden yet. Add some!</p>
            )}
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>My Reminders</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {reminders.length > 0 ? (
              <ul>
                {reminders.map(reminder => (
                  <li
                    key={reminder.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    {reminder.text}
                    <Button variant="outline" size="sm" onClick={() => deleteReminder(reminder.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reminders yet. Add some!</p>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
            <Button onClick={() => {
                signOut();
                router.push('/'); 
            }}>
                Sign Out
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">My Garden</h1>
        <p className="text-muted-foreground">
          Please sign up or sign in to access your garden.
        </p>
      </section>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={isSignUp ? handleSignUp : handleSignIn}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading
              ? isSignUp
                ? 'Signing up...'
                : 'Signing in...'
              : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsSignUp(prev => !prev)}
            className="w-full"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </CardContent>
      </Card>
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
                <Button variant="ghost" className="flex flex-col items-center justify-center" onClick={() => router.push('/disease')}>
                    <Icons.leaf className="h-5 w-5 mb-1" />
                    <span className="text-xs">Identify</span>
                </Button>
            </nav>
        </footer>
    </div>
  );
}
