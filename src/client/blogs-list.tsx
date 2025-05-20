'use client';
import { IsError } from '@/server/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface Blog {
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
  blogs: Blog[];
}
interface HN_BlogViewerState {
  selected_id: number;
}
export function HN_BlogViewer(props: HN_BlogViewerProps) {
  const { data, error, isLoading } = useSWR(
    'http://localhost:3000/api/posts',
    postsFetcher
  );
  const [state, setState] = useState<Blog[]>([]);
  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading posts...</div>;
  }
  if (error) {
    return <div>Error...</div>;
  }

  return (
    <div className="container m-auto max-w-2xl mt-5 bg-gray-100 p-5">
      {state.map((blog, index) => (
        <div key={index} className="mb-1.5">
          <h1 className='text-md font-bold cursor-pointer' onClick={()=> {}} >
            {blog.title} – <span className='font-medium text-xs'>({blog.external_link})</span>
          </h1>
          <div className="flex gap-1">
            <p className='text-xs'>
              upvotes: <span>{blog.upvotes}</span>
            </p>
            <p className='text-xs'>
              downvotes: <span>{blog.downvotes}</span>
            </p>
            <p className='text-xs'>
              posted by – <Link href={`/${blog.author_username}`}><span className='underline'>{blog.author_username}</span></Link>
            </p>
            <p className='text-xs'>
              comments: (<span>{blog.comments.length}</span>)
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
