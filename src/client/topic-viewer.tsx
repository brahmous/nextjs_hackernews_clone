'use client';
import { IsError, MyError } from '@/server/types';
import Form from 'next/form';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  HN_Button,
  HN_ButtonType,
  HN_Input,
  HN_Label,
} from './login-form-component';
import { SA_CreateTopic } from '@/server/topics';
import { IsValidationError } from '@/db/types';
import { CreatePostValidationError } from '@/db/post';

function HN_SuccessMessage({
  message,
  remove_self,
}: {
  message: string;
  remove_self: () => void;
}) {
  useEffect(() => {
    setTimeout(() => {
      //remove_self();
    }, 3000);
  }, []);
  return <div className="">{message}</div>;
}

interface TopicDTO {
  title: string;
  external_link: string;
  poste_date: number;
  author_username: string;
  upvotes: number;
  downvotes: number;
  comments: string[] /*TODO: update later with replies */;
  blog_text: string;
}

async function postsFetcher(route: string) {
  const fetch_posts_result = await fetch(route);
  const data = await fetch_posts_result.json();
  return data;
}

interface HN_BlogViewerProps {
  blogs: TopicDTO[];
}

interface HN_CreatePostValidationError {
  title: string[];
  text: string[];
  external_link: string[];
  validation_errors_count: number;
}
enum HN_TopicViewerStateTypes {
  TOPIC_LIST,
  EXPANDED_TOPIC,
  CREATE_TOPIC,
}

/*
These types might have to go to the backend
*/
type HN_PostCreated = { title: string } | null;

type HN_CreateTopicFormState =
  | HN_PostCreated
  | MyError
  | HN_CreatePostValidationError;

type HN_TopicViewerState = { topics: TopicDTO[] } & (
  | {
      type: HN_TopicViewerStateTypes.TOPIC_LIST;
      popup_state: { display: boolean; content: string };
    }
  | { type: HN_TopicViewerStateTypes.EXPANDED_TOPIC; topic_index: number }
  | {
      type: HN_TopicViewerStateTypes.CREATE_TOPIC;
      create_topic_form_state: HN_CreateTopicFormState;
    }
);

const state: HN_TopicViewerState = {
  type: HN_TopicViewerStateTypes.CREATE_TOPIC,
  topics: [],
  create_topic_form_state: null,
};

export function HN_BlogViewer(props: HN_BlogViewerProps) {
  const { data, error, isLoading } = useSWR(
    'http://localhost:3000/api/posts',
    postsFetcher, {
      dedupingInterval: 0
    }
  );

  const [state, setState] = useState<HN_TopicViewerState>({
    type: HN_TopicViewerStateTypes.TOPIC_LIST,
    popup_state: { display: false, content: '' },
    topics: [],
  });

  const [formState, formAction, pending] = useActionState(SA_CreateTopic, {
    title: '',
  });

  useEffect(() => {
    if (data) {
      setState({ ...state, topics: data });
    }
  }, [data]);

  useEffect(() => {
    if (IsError(formState)) {
      setState({
        ...state,
        type: HN_TopicViewerStateTypes.CREATE_TOPIC,
        create_topic_form_state: {
          error_code: formState.error_code,
          error_message: formState.error_message,
        } as MyError,
      });
    } else if (IsValidationError<HN_CreatePostValidationError>(formState)) {
      setState({
        ...state,
        type: HN_TopicViewerStateTypes.CREATE_TOPIC,
        create_topic_form_state: {
          title: formState.title,
          text: formState.text,
          external_link: formState.external_link,
        } as HN_CreatePostValidationError,
      });
    } else {
      setState({
        ...state,
        type: HN_TopicViewerStateTypes.TOPIC_LIST,
        popup_state: { display: true, content: formState.title },
      });
    }
  }, [formState]);

  if (error) {
    return <div>Error...</div>;
  }

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  // Flex
  return (
    <div className="flex justify-between">
      <div className="border">
        <p>Left Panel</p>
      </div>
      {state.type == HN_TopicViewerStateTypes.CREATE_TOPIC && (
        <div>
          <Form action={formAction}>
            <div className="mb-5">
              <HN_Label value="Title" />
              <HN_Input name="title" type="text" />
            </div>
            <div className="mb-5">
              <HN_Label value="External Link" />
              <HN_Input name="external-link" type="text" />
            </div>
            <div className="mb-5">
              <HN_Label value="Text" />
              <HN_Input name="text" type="text" />
            </div>
            <HN_Button
              value="Create"
              type={HN_ButtonType.SUBMIT}
              pending={pending}
            />
          </Form>
        </div>
      )}

      {state.type == HN_TopicViewerStateTypes.EXPANDED_TOPIC &&
        (() => {
          if (
            state.topic_index >= 0 &&
            state.topic_index < state.topics.length
          ) {
            const { title, external_link, blog_text } =
              state.topics[state.topic_index];
            return (
              <div>
                <button>{' << '} go back!</button>
                <h1> {title} </h1>
                <p className="underline italic">{external_link}</p>
                <p>{blog_text}</p>
              </div>
            );
          }
          return (
            <div>
              <button>{' << '} go back!</button>
              <div>Error loading topic...</div>
            </div>
          );
        })()}

      {state.type == HN_TopicViewerStateTypes.TOPIC_LIST && (
        <div>
          {state.popup_state.display ? (
            <HN_SuccessMessage
              message={state.popup_state.content}
              remove_self={() => {
                setState({
                  ...state,
                  popup_state: { display: false, content: '' },
                });
              }}
            />
          ) : null}

          <div className="container m-auto max-w-2xl mt-5 bg-gray-100 p-5">
            {(state.topics.length == 0 && (
              <div>There are no topics to view...</div>
            )) ||
              state.topics.map((blog, index) => (
                <div key={index} className="mb-1.5">
                  <h1
                    className="text-md font-bold cursor-pointer"
                    onClick={() => {
                      setState({
                        ...state,
                        type: HN_TopicViewerStateTypes.EXPANDED_TOPIC,
                        topic_index: index,
                      });
                    }}
                  >
                    {blog.title} –{' '}
                    <span className="font-medium text-xs">
                      ({blog.external_link})
                    </span>
                  </h1>
                  <div className="flex gap-1">
                    <p className="text-xs">
                      upvotes: <span>{blog.upvotes}</span>
                    </p>
                    <p className="text-xs">
                      downvotes: <span>{blog.downvotes}</span>
                    </p>
                    <p className="text-xs">
                      posted by –{' '}
                      <Link href={`/${blog.author_username}`}>
                        <span className="underline">
                          {blog.author_username}
                        </span>
                      </Link>
                    </p>
                    <p className="text-xs">
                      comments: (<span>{blog.comments.length}</span>)
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="border">
        <p>right Panel</p>
        <button
          type="button"
          onClick={() => {
            setState({
              ...state,
              type: HN_TopicViewerStateTypes.CREATE_TOPIC,
              create_topic_form_state: null,
            });
          }}
        >
          create new topic
        </button>
      </div>
    </div>
  );
}
