'use client';
import { useContext, useEffect } from 'react';
import { useState } from 'react';
import { LoginUser, Logout } from '@/server/auth';
import { IsError, LoginFormState } from '@/server/types';
import { useActionState } from 'react';
import Form from 'next/form';
import { AuthContext, AuthContextState } from './auth-provider';
import { RegisterUserFormState, IsRegisterUserFormError } from '@/server/types';
import { RegisterUser } from '@/server/auth';
import { mutate } from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//////////////////////////////////////////
// Client.
export function HN_Logo() {
  return (
    <p className="cursor-pointer font-bold text-(length:--text-logo-size-1)">
      Hacker News
    </p>
  );
}

export function HN_LoginButton() {
  return (
    <Link href="/" className="text-(length:--menu-text-size) font-normal">
      Login
    </Link>
  );
}

export function HN_SignupButton() {
  return (
    <Link href="/signup" className="text-(length:--menu-text-size) font-normal">
      Sign Up
    </Link>
  );
}

export function HN_LogoutButton() {

  const router = useRouter();

  return (
    <button
      className="cursor-pointer text-(length:--menu-text-size) font-normal"
      onClick={async () => {
        const logout_result = await Logout();
        mutate("http://localhost:3000/api/me");
        router.push("/");
      }}
    >
      Logout
    </button>
  );
}

export interface HN_HeaderProps {
  logged_in: boolean;
}

export function HN_Header() {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    console.log('HN_Header rendered.');
  });

  return (
    <div className="flex border justify-between py-2 px-5">
      <HN_Logo />
      <div className="flex justify-between gap-5 ">
        {authContext.state == AuthContextState.NOT_LOGGED_IN && (
          <HN_LoginButton />
        )}
        {authContext.state == AuthContextState.NOT_LOGGED_IN && (
          <HN_SignupButton />
        )}
        {authContext.state == AuthContextState.LOGGED_IN && <HN_LogoutButton />}
      </div>
    </div>
  );
}

export function HN_SignupForm() {
  const api_route: string = 'http://localhost:3000/api/me';
  const context = useContext(AuthContext);
  const router = useRouter();
  const [formState, setFormState] = useState<RegisterUserFormState>(false);
  const [actionState, action, pending] = useActionState(RegisterUser, false);

  useEffect(() => {
    if (IsError(actionState) || IsRegisterUserFormError(actionState)) {
      console.log({ actionState });
      setFormState(actionState);
    } else {
      if (context.set_auth && actionState == true) {
        mutate(api_route);
        context.set_auth({state: AuthContextState.LOGGED_IN});
      }
    }
  }, [actionState]);

  return (
    <div className="flex flex-col w-40 px-5 m-auto">
      <p className="text-(length:--text-logo-size-1) py-2">Signup</p>

      <Form action={action} className="flex flex-col">
        {IsError(formState) && (
          <p className="text-[#ff0000]">{formState.error_message}</p>
        )}
        <label
          className="
						text-(length:--menu-text-size)"
        >
          Username
          {IsRegisterUserFormError(formState) &&
            formState.username.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <input name="username" type="text" className="border" />
        </label>

        <label
          className="
						text-(length:--menu-text-size)"
        >
          Email
          {IsRegisterUserFormError(formState) &&
            formState.emai.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <input name="email" type="text" className="border" />
        </label>

        <label
          className="
						text-(length:--menu-text-size)"
        >
          Password
          {IsRegisterUserFormError(formState) &&
            formState.password.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <input name="password" type="password" className="border" />
        </label>

        <button
          className="border
						text-(length:--menu-text-size) mt-2"
          type="submit"
          disabled={pending}
        >
          Sign up
        </button>
      </Form>
    </div>
  );
}

export function HN_LoginForm() {
  const context = useContext(AuthContext);
  const [formState, setFormState] = useState<LoginFormState>();
  const [actionState, formAction, pending] = useActionState(LoginUser, false);
  const api_route: string = 'http://localhost:3000/api/me';

  useEffect(() => {
    if (IsError(actionState)) {
      setFormState({
        error_code: actionState.error_code,
        error_message: actionState.error_message,
      });
    } else {
      if (actionState && context.set_auth) {
        mutate(api_route);
        context.set_auth({ state: AuthContextState.LOGGED_IN });
      }
    }
  }, [actionState]);

  return (
    <div /*Div to position the form.*/
      className="flex flex-col w-40 px-5 m-auto"
    >
      <p className="text-(length:--text-logo-size-1) py-2">Login</p>
      {IsError(formState) && (
        <ul>
          <li className="text-[#ff0000]">{formState.error_message} </li>{' '}
        </ul>
      )}
      <Form action={formAction} className="flex flex-col">
        <label
          className="
						text-(length:--menu-text-size)"
        >
          Email
          <input name="email" className="border" />
        </label>
        <label
          className="
						text-(length:--menu-text-size)"
        >
          Password:
          <input name="password" type="password" className="border" />
        </label>
        <button
          type="submit"
          className="border
						text-(length:--menu-text-size) mt-2 w-100%"
        >
          Login
        </button>
      </Form>
    </div>
  );
}
