'use client';

import { MeAPIRouteResponseType } from '@/app/api/me/route';
import { IsError, MyError } from '@/server/types';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';
import useSWR from 'swr';

export enum AuthContextState {
	PENDING,
	LOGGED_IN,
	NOT_LOGGED_IN
}

export interface AuthContextType {
  state: AuthContextState;
}

async function fetchMe(
  api_route: string = 'http://localhost:3000/api/me'
): Promise<AuthContextType> {
  const fetch_result = await fetch(api_route);
  const data: MyError | MeAPIRouteResponseType = await fetch_result.json();

	// alert("fetcher");

  console.log('fetcher executed: ', data );

  if (IsError(data)) {
    throw 'something';
  }

	// alert("hereherhehre");

  return { state: data.logged_in ? AuthContextState.LOGGED_IN : AuthContextState.NOT_LOGGED_IN } as AuthContextType;
}

export const AuthContext = createContext<
  AuthContextType & { set_auth?: Dispatch<SetStateAction<AuthContextType>> }
>({ state: AuthContextState.NOT_LOGGED_IN });

export function AuthProvider(props: { children: React.ReactNode }) {
  const me_api_url: string = 'http://localhost:3000/api/me';

  const [authSate, setAuthState] = useState<AuthContextType>({
    state: AuthContextState.PENDING,
  });
  
  const { data, error, isLoading } = useSWR(me_api_url, fetchMe);


  useEffect(() => {
  	console.log("here: ", {data, error, isLoading});
    if (data && data.state != authSate.state) {
      setAuthState({ state: data.state });
    }
  }, [data]);

  //let isLoading = true;
  //let error = false;

  return (
    <AuthContext.Provider
      value={{
        state: authSate.state /*authSate.logged_in*/,
        set_auth: setAuthState,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );

  // console.log("AuthProvider rendered...");

  // async function getMe() {
  // 	const fetch_result = await fetch("http://localhost:3000/api/me");
  // 	const data: AuthContextType = await fetch_result.json();

  // 	if (data.logged_in != authSate.logged_in) {
  // 		setAuthState({ ...data });
  // 	}
  // }

  // getMe();
}
