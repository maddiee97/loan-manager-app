// client/src/components/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input"; // Our new component
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Coins } from "lucide-react"; // Icons

const Auth = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  
const handleLogin = async (e) => {
  e.preventDefault();
  setMessage('');
  setIsError(false);
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    const { token } = res.data;
    
    // THE CHANGE IS HERE:
    localStorage.setItem('token', token);
    navigate('/dashboard'); 

  } catch (err) {
    setMessage(err.response.data.message);
    setIsError(true);
  }
};


  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { email, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response.data.message);
      setIsError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Coins className="h-8 w-8" />
      <h1 className="text-2xl font-semibold tracking-tight">Loan Manager</h1>

      <Tabs defaultValue="signin" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        {/* Sign In Tab */}
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Welcome back! Please enter your details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <IconInput id="email-login" type="email" placeholder="name@example.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <IconInput id="password-login" type="password" placeholder="••••••••" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create your account to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <IconInput id="email-register" type="email" placeholder="name@example.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <IconInput id="password-register" type="password" placeholder="••••••••" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {message && (
        <div className="mt-4 text-center">
          <p className={isError ? 'text-red-500 text-sm' : 'text-green-500 text-sm'}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Auth;