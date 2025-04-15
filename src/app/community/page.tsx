"use client";

import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {app} from '@/firebase';
import Image from 'next/image';
import {getAuth} from 'firebase/auth';
import {Heart, MessageSquare} from 'lucide-react';

export default function CommunityPage() {
  const {data: session} = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const [commentText, setCommentText] = useState('');

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
    const loadPosts = async () => {
      if (!db) return;

      setLoading(true);
      try {
        const postsCollection = query(
          collection(db, 'communityPosts'),
          orderBy('timestamp', 'desc')
        );
        const postSnapshot = await getDocs(postsCollection);
        const postList = postSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setPosts(postList);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load posts.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [session, db, toast]);

  const addPost = async () => {
    if (!db || !storage || !auth) return;
    if (newPostText.trim() === '') return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (newPostImage) {
        const storageRef = ref(storage, `communityPosts/${newPostImage.name}`);
        await uploadBytes(storageRef, newPostImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'communityPosts'), {
        text: newPostText,
        imageUrl: imageUrl,
        userId: session?.user?.email,
        displayName: session?.user?.name,
        timestamp: serverTimestamp(),
        likes: [], // Initialize likes array
        comments: [], // Initialize comments array
      });
      setNewPostText('');
      setNewPostImage(null);
      toast({
        title: 'Post Added!',
        description: 'Your post has been successfully added.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add post.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
        if (!db) return;

    setLoading(true);
    try {
      const postDoc = doc(db, 'communityPosts', postId);
      await deleteDoc(postDoc);
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: 'Post Deleted!',
        description: 'Your post has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete post.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPostImage(file);
    }
  };

  const likePost = async (postId: string) => {
        if (!db) return;

    if (!session?.user?.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to like a post.',
      });
      return;
    }

    const postDoc = doc(db, 'communityPosts', postId);
    try {
      await updateDoc(postDoc, {
        likes: arrayUnion(session.user.email),
      });
      setPosts(
        posts.map(post =>
          post.id === postId ? {...post, likes: [...post.likes, session.user.email]} : post
        )
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to like post.',
      });
    }
  };

  const unlikePost = async (postId: string) => {
        if (!db) return;

    if (!session?.user?.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to unlike a post.',
      });
      return;
    }

    const postDoc = doc(db, 'communityPosts', postId);
    try {
      await updateDoc(postDoc, {
        likes: arrayRemove(session.user.email),
      });
      setPosts(
        posts.map(post =>
          post.id === postId ? {...post, likes: post.likes.filter((user: any) => user !== session.user.email)} : post
        )
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to unlike post.',
      });
    }
  };

  const addComment = async (postId: string) => {
        if (!db) return;

    if (commentText.trim() === '') return;

    if (!session?.user?.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to comment.',
      });
      return;
    }

    const postDoc = doc(db, 'communityPosts', postId);
    try {
      await updateDoc(postDoc, {
        comments: arrayUnion({
          text: commentText,
          userId: session.user.email,
          displayName: session.user.name,
          timestamp: serverTimestamp(),
        }),
      });
      setPosts(
        posts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    text: commentText,
                    userId: session.user.email,
                    displayName: session.user.name,
                    timestamp: new Date(),
                  },
                ],
              }
            : post
        )
      );
      setCommentText('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add comment.',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Plant Community</h1>
        <p className="text-muted-foreground">Share your plant journey and connect with other plant lovers.</p>
      </section>

      {session ? (
        <>
          <Card className="w-full max-w-lg mx-auto mb-8">
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={addPost} disabled={loading}>
                  Add Post
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Community Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {posts.length > 0 ? (
                <ul>
                  {posts.map(post => (
                    <li key={post.id} className="py-4 border-b last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="font-semibold">{post.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {post.timestamp?.toDate().toLocaleTimeString()}
                        </div>
                      </div>
                      {post.imageUrl && (
                        <div className="relative w-full h-64 rounded-md overflow-hidden mb-2">
                          <Image
                            src={post.imageUrl}
                            alt="Post Image"
                            layout="fill"
                            objectFit="contain"
                            width={500}
                            height={500}
                          />
                        </div>
                      )}
                      <p>{post.text}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (post.likes.includes(session.user.email) ? unlikePost(post.id) : likePost(post.id))}
                        >
                          <Heart
                            className={`h-5 w-5 ${post.likes.includes(session.user.email) ? 'text-red-500' : ''}`}
                          />
                          <span>{post.likes.length}</span>
                        </Button>

                        <div>
                          <Input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <Button variant="outline" size="sm" onClick={() => addComment(post.id)}>
                            Comment
                          </Button>
                        </div>
                      </div>
                      {post.userId === session?.user?.email && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => deletePost(post.id)}>
                            Delete
                          </Button>
                        </div>
                      )}

                      {post.comments.map((comment: any, index: number) => (
                        <div key={index} className="mt-2 ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="font-semibold">{comment.displayName}</div>
                            <div className="text-sm text-muted-foreground">
                              {comment.timestamp?.toDate().toLocaleTimeString()}
                            </div>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No posts yet. Be the first to share!</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center">
          <p>Please sign in to access the community features.</p>
        </div>
      )}
    </div>
  );
}
