'use client';
import { useContext, useEffect, useLayoutEffect } from 'react';
import { AuthContext, AuthContextState } from './auth-provider';
import { useRouter } from 'next/navigation';
import { kMaxLength } from 'buffer';

export function RedirectIfLoggedIn({
  children,
}: {
  children: React.ReactNode;
}) {
  // alert('Redirect if logged in top level');
  const context = useContext(AuthContext);
  const router = useRouter();

  useLayoutEffect(() => {
    if (context.state == AuthContextState.LOGGED_IN) {
      // alert(
      //   'Redirect if logged in use effect | context.state == AuthContextState.LOGGED_IN '
      // );
      router.replace('/dashboard');
    }
  }, [context, router]);

  useEffect(() => {
    // alert('Redirect if logged in use effect');
  });

  return (
    (context.state == AuthContextState.PENDING && (
      <div className="text-[#0000FF]">Loading...</div>
    )) ||
    (context.state == AuthContextState.LOGGED_IN && (
      <h1>Redirecting... to /dashboard</h1>
    )) ||
    (context.state == AuthContextState.NOT_LOGGED_IN && (
      // Render loading auth here
      <>{children}</>
    ))
  );
}

export function RedirectIfNotLoggedIn({
  children,
}: {
  children: React.ReactNode;
}) {
  // alert('Redirect if not logged in top level');
  const context = useContext(AuthContext);
  const router = useRouter();

  useLayoutEffect(() => {
    if (context.state == AuthContextState.NOT_LOGGED_IN) {
      // alert(
      //   'redirect if not logged in use effect | context.state == AuthContextState.NOT_LOGGED_IN'
      // );
      router.replace('/');
    }
  }, [context, router]);

  useEffect(() => {
    // alert('Redirect if not logged in use effect');
  });
  return (
    (context.state == AuthContextState.PENDING && (
      <div className="text-[#0000FF]">Loading...</div>
    )) ||
    (context.state == AuthContextState.NOT_LOGGED_IN && (
      <h1>redirecting... to /</h1>
    )) ||
    (context.state == AuthContextState.LOGGED_IN && <>{children}</>)
  );
}
