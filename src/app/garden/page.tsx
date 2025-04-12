'use client';

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
import {getFirestore, collection, addDoc, getDocs, deleteDoc, doc} from 'firebase/firestore';
import {app} from '@/firebase';

export default function MyGardenPage() {
  const {data: session, status} = useSession();
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const loadReminders = async () => {
      if (session?.user?.email) {
        setLoading(true);
        try {
          const remindersCollection = collection(db, 'users', session.user.email, 'reminders');
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

    loadReminders();
  }, [session, db, toast]);

  const addReminder = async () => {
    if (newReminder.trim() !== '' && session?.user?.email) {
      setLoading(true);
      try {
        const remindersCollection = collection(db, 'users', session.user.email, 'reminders');
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

  const deleteReminder = async (reminderId: string) => {
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

  if (status === 'loading') {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (!session) {
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
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">My Garden</h1>
        <p className="text-muted-foreground">Manage your plants and set reminders.</p>
      </section>

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
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>
    </div>
  );
}
