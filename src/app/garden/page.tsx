"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyGardenPage() {
  const { data: session, status } = useSession();
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState('');

  useEffect(() => {
    // Simulate fetching reminders from a database or local storage
    if (session?.user?.email) {
      const storedReminders = localStorage.getItem(`reminders-${session.user.email}`);
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem(`reminders-${session.user.email}`, JSON.stringify(reminders));
    }
  }, [reminders, session]);

  const addReminder = () => {
    if (newReminder.trim() !== '' && session?.user?.email) {
      setReminders([...reminders, newReminder]);
      setNewReminder('');
    }
  };

  const deleteReminder = (index: number) => {
    const newReminders = [...reminders];
    newReminders.splice(index, 1);
    setReminders(newReminders);
  };

  if (status === 'loading') {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <section className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">My Garden</h1>
          <p className="text-muted-foreground">Please sign in to access your garden.</p>
        </section>
        <div className="text-center">
          <Button onClick={() => signIn()}>Sign In</Button>
        </div>
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
            <input
              type="text"
              placeholder="Enter a reminder"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={addReminder}>Add</Button>
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
              {reminders.map((reminder, index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  {reminder}
                  <Button variant="outline" size="sm" onClick={() => deleteReminder(index)}>Delete</Button>
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

