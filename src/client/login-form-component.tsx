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
    <Link
      href={'/'}
      className='className="cursor-pointer font-bold text-xs bg-black text-white flex flex-col justify-center items-center'
    >
      <p className="p-2">HN</p>
    </Link>
  );
}

export function HN_LogoutButton() {
  const router = useRouter();

  return (
    <HN_Button
      value="Logout"
      type={HN_ButtonType.LINK}
      onClick={async () => {
        const logout_result = await Logout();
        mutate('http://localhost:3000/api/me');
        router.push('/');
      }}
    />
  );
}

export interface HN_HeaderProps {}

export function HN_Header(props: HN_HeaderProps) {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    console.log('HN_Header rendered.');
  });

  return (
    <div className="flex border justify-between items-center py-2 px-5">
      <HN_Logo />
      <div className="flex justify-between gap-5 ">
        {authContext.state == AuthContextState.NOT_LOGGED_IN && (
          <HN_Button type={HN_ButtonType.LINK} href="/" value="Login" />
        )}
        {authContext.state == AuthContextState.NOT_LOGGED_IN && (
          <HN_Button type={HN_ButtonType.LINK} href="/signup" value="Sign Up" />
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
        context.set_auth({ state: AuthContextState.LOGGED_IN });
      }
    }
  }, [actionState]);

  return (
    <div className="flex flex-col max-w-sm px-5 m-auto">
      <p className="text-(length:--text-logo-size-1) py-2 text-center">
        Signup
      </p>

      <Form action={action} className="flex flex-col">
        {IsError(formState) && (
          <p className="text-[#ff0000]">{formState.error_message}</p>
        )}
        <div className="mb-5">
          <HN_Label value="Username" />
          {IsRegisterUserFormError(formState) &&
            formState.username.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <HN_Input name="username" type="text" />
        </div>
        <div className="mb-5">
          <HN_Label value="Email" />
          {IsRegisterUserFormError(formState) &&
            formState.emai.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <HN_Input name="email" type="email" />
        </div>
        <div className="mb-5">
          <HN_Label value="password" />
          {IsRegisterUserFormError(formState) &&
            formState.password.map((error_message) => (
              <p className="text-[#ff0000]">{error_message}</p>
            ))}
          <HN_Input name="password" type="password" />
        </div>
        <HN_Button
          type={HN_ButtonType.SUBMIT}
          pending={pending}
          value="Sign Up"
        />
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
      className="flex flex-col max-w-sm px-5 m-auto"
    >
      <p className="text-(length:--text-logo-size-1) text-center py-2">Login</p>
      {IsError(formState) && (
        <ul>
          <li className="text-[#ff0000]">{formState.error_message} </li>{' '}
        </ul>
      )}
      <Form action={formAction} className="flex flex-col">
        <div className="mb-5">
          <HN_Label value="Email" />
          <HN_Input name="email" type="email" />
        </div>
        <div className="mb-5">
          <HN_Label value="Password" />
          <HN_Input name="password" type="password" />
        </div>
        <HN_Button
          type={HN_ButtonType.SUBMIT}
          pending={pending}
          value="Login"
        />
      </Form>
    </div>
  );
}

interface HN_InputProps {
  name: string;
  type: string;
}

export function HN_Input({ name, type }: HN_InputProps) {
  return (
    <input
      name={name}
      type={type}
      className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
    />
  );
}

enum HN_ButtonType {
  LINK,
  SUBMIT,
}

interface HN_SubmitButtonProps {
  type: HN_ButtonType.SUBMIT;
  pending: boolean;
  value: string;
}

interface HN_LinkButtonProps {
  type: HN_ButtonType.LINK;
  href?: string;
  bg_color?: string;
  value: string;
  onClick?: () => Promise<void>;
}

export function HN_Button(props: HN_SubmitButtonProps | HN_LinkButtonProps) {
  if (props.type == HN_ButtonType.LINK) {
    return (
      <Link href={props.href ? props.href : '#'}>
        <button
          className={`
            ring-2 ring-transparent hover:ring-gray-300
            cursor-pointer
            text-white
            bg-black
            hover:ring-gray-300
            focus:ring-4
            focus:outline-none
            focus:ring-gray-300
            font-bold
            rounded-md
            text-xs
            px-5 py-1.5
            text-center`}
          type="button"
          onClick={() => {
            if (props.onClick) {
              props.onClick();
            }
          }}
        >
          {props.value}
        </button>
      </Link>
    );
  }
  return (
    <button
      className={`
      ring-4 ring-transparent hover:ring-gray-300
      cursor-pointer
      text-white
      bg-black
      hover:ring-gray-300
      focus:ring-4
      focus:outline-none
      focus:ring-gray-300
      font-bold
      rounded-lg
      text-sm
      px-5 py-2.5
      text-center`}
      type="submit"
      disabled={props.pending}
    >
      {props.value}
    </button>
  );
}

interface HN_LabelProps {
  value: string;
}

export function HN_Label(props: HN_LabelProps) {
  return (
    <label className="block mb-2 text-(length:--menu-text-size) font-medium text-gray-900">
      {props.value}
    </label>
  );
}
