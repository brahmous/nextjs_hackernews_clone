'use client';
import { useContext, useEffect } from 'react';
import { useState } from 'react';
import { LoginUser } from '@/server/auth';
import { IsError, LoginFormState } from '@/server/types';
import { useActionState } from 'react';
import Form from 'next/form';
import { AuthContext, AuthContextState } from './auth-provider';
import { RegisterUserFormState, IsRegisterUserFormError } from '@/server/types';
import { RegisterUser } from '@/server/auth';
import { mutate } from 'swr';

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
    <button className="text-(length:--menu-text-size) font-normal">
      Login
    </button>
  );
}

export function HN_SignupButton() {
  return (
    <button className="text-(length:--menu-text-size) font-normal">
      Sign Up
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
        {!(authContext.state == AuthContextState.LOGGED_IN) && <HN_LoginButton />}
        {!(authContext.state == AuthContextState.LOGGED_IN) && <HN_SignupButton />}
      </div>
    </div>
  );
}

export function HN_SignupForm() {
  const [formState, setFormState] = useState<RegisterUserFormState>(false);
  const [actionState, action, pending] = useActionState(RegisterUser, false);

  useEffect(() => {
    console.log({ actionState });
    mutate('http://localhost:3000/api/me');
    setFormState(actionState);
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

  useEffect(() => {
    if (IsError(actionState)) {
      console.log('hhhhhhhhhhheeeeeeeeeeeeerrrrrrrrrrrrrreeeeeeeeeeeeeee');
      setFormState({
        error_code: actionState.error_code,
        error_message: actionState.error_message,
      });
    } else {
      console.log({ actionState });
      if (actionState && context.set_auth) {
        mutate('http://localhost:3000/api/me');
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
