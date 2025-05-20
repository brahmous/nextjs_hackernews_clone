import prisma from '@/lib/prisma/prisma';
import { Prisma } from '@/generated/prisma';
import { MyError } from '@/server/types';
import { z } from 'zod';

interface PostDTO {
  post_id: number;
  author: {
    id: number;
    username: string;
  };
  title: string;
  text: string;
  external_link: string;
}

interface CreatePostInputArgs {
  author_id?: number;
  title?: string;
  text?: string;
  external_link?: string;
}

interface CreatePostValidationError {
  author_id: string[];
  title: string[];
  text: string[];
  external_link: string[];
  validation_errors_count: number;
}

const create_post_input_schema = z.object({
  author_id: z.number(),
  title: z.string().min(1).max(1024),
  text: z.string().min(1),
  external_link: z.string().url(),
});

interface UpdatePostInputArgs {
  author_id?: number;
  title?: string;
  text?: string;
  external_link?: string;
}

interface UpdatePostValidationError {
  title: string[];
  text: string[];
  external_link: string[];
  validation_errors_count: number;
}
const update_post_input_schema = z.object({
  title: z.string().min(1).max(1024).optional(),
  text: z.string().min(1).optional(),
  external_link: z.string().url().optional(),
});

export default class PostDB {
  async create_post(
    input_args: CreatePostInputArgs
  ): Promise<PostDTO | CreatePostValidationError | MyError> {
    let validation_result = create_post_input_schema.safeParse(input_args);

    if (!validation_result.success) {
      const { author_id, external_link, text, title } =
        validation_result.error.flatten().fieldErrors;
      return {
        author_id: author_id ? author_id : [],
        external_link: external_link ? external_link : [],
        text: text ? text : [],
        title: title ? title : [],
        validation_errors_count: 0,
      } as CreatePostValidationError;
    }

    const validated_input = validation_result.data;

    const postData: Prisma.hn_postCreateInput = {
      title: validated_input.title,
      external_link: validated_input.external_link,
      body: validated_input.text,
      author: {
        connect: {
          id: validated_input.author_id,
        },
      },
    };

    try {
      const create_result = await prisma.hn_post.create({
        data: postData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      return {
        author: {
          id: create_result.author.id,
          username: create_result.author.username,
        },
        post_id: create_result.id,
        title: create_result.title,
        text: create_result.body,
        external_link: create_result.external_link,
      } as PostDTO;
    } catch (err) {
      console.log(err);
      return {
        error_code: 2000,
        error_message: 'catch block caught an error check it later',
      } as MyError;
    }
  }

  async read_posts(size: number): Promise<PostDTO[] | MyError> {
    try {
      const read_result = await prisma.hn_post.findMany({
        take: size,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      // const posts: PostDTO[] = [];

      // for (let i = 0; i < read_result.length; i++) {
      //   const post = read_result[i];
      //   posts.push({
      //     author: {
      //       id: post.author.id,
      //       username: post.author.username
      //     },
      //     post_id: post.id,
      //     title: post.title,
      //     text: post.body,
      //     external_link: post.external_link
      //   });
      // }

      return read_result.map((post) => ({
        author: {
          id: post.author.id,
          username: post.author.username,
        },
        post_id: post.id,
        title: post.title,
        text: post.body,
        external_link: post.external_link,
      }));
    } catch (err) {
      return {
        error_code: 2000,
        error_message: 'place holder return value!',
      } as MyError;
    }
  }

  async read_posts_by_author(author_id: number): Promise<PostDTO[] | MyError> {
    /*
      NOTE: define a deferent DTO that doesn't include author and modify the query to not include it.
    */
    try {
      const read_result = await prisma.hn_post.findMany({
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        where: {
          author_id,
        },
      });

      return read_result.map((post) => ({
        author: {
          id: post.author.id,
          username: post.author.username,
        },
        post_id: post.id,
        title: post.title,
        text: post.body,
        external_link: post.external_link,
      }));
    } catch (err) {
      return {
        error_code: 2000,
        error_message: 'error caught in catch block',
      } as MyError;
    }
  }

  /*NOTE: the name CreatePostValidationError is not appropriate since it's being used for updates too */
  async update_post_by_id(
    post_id: number,
    args: UpdatePostInputArgs
  ): Promise<void | UpdatePostValidationError | MyError> {
    /*

    */
    const validation_result = update_post_input_schema.safeParse(args);
    console.log(validation_result);

    if (!validation_result.success) {
      const { external_link, text, title } =
        validation_result.error.flatten().fieldErrors;
      return {
        external_link: external_link ? external_link : [],
        text: text ? text : [],
        title: title ? title : [],
      } as CreatePostValidationError;
    }

    const update_data: Prisma.hn_postUpdateInput = {};
    const { title, text, external_link } = validation_result.data;
    if (title) update_data.title = title;
    if (text) update_data.body = text;
    if (external_link) update_data.external_link = external_link;

    try {
      const update_result = await prisma.hn_post.update({
        data: update_data,
        where: { id: post_id },
      });
      console.log({ update_result });
      return; /* Update success return void. */
    } catch (err) {
      return {
        error_code: 2000,
        error_message: 'data base error caught in the catch block of update!',
      } as MyError;
    }
  }

  async delete_post_by_id(post_id: number): Promise<void | MyError> {
    try {
      const delte_result = await prisma.hn_post.delete({
        where: {
          id: post_id,
        },
      });
      return; /* Delete success return void */
    } catch (err) {
      return {
        error_code: 2000,
        error_message: 'data base error caught in the catch block of delete!',
      } as MyError;
    }
  }

  async upvote_post(): Promise<void | MyError> {}

  async downvote_post(): Promise<void | MyError> {}
}

const post_db: PostDB = new PostDB();

async function test() {
  // const result = await post_db.create_post({
  //   author_id: 35,
  //   external_link: 'http://google.com',
  //   title: 'Hello world',
  //   text: 'Programming is very fun!',
  // });

  // console.log({ result });

  const data = [
    {
      title: 'Understanding Async/Await in JavaScript',
      external_link: 'https://devblog.io/async-await-guide',
      poste_date: 1716000000,
      author_username: 'tech_guru21',
      upvotes: 120,
      downvotes: 3,
      comments: [
        'Great explanation!',
        'Helped me a lot, thanks!',
        'What about error handling?',
      ],
      blog_text:
        'Async/await is a modern way to handle asynchronous operations in JavaScript. It simplifies code readability and maintenance compared to traditional promise chains...',
    },
    {
      title: 'A Beginner’s Guide to Docker Containers',
      external_link: 'https://containers101.dev/docker-guide',
      poste_date: 1715900000,
      author_username: 'devnoob42',
      upvotes: 98,
      downvotes: 7,
      comments: [
        'Awesome!',
        'Could you include docker-compose?',
        'What OS are you using?',
      ],
      blog_text:
        'Docker containers allow you to package applications with their dependencies and run them in isolated environments. This guide covers the basics you need to get started...',
    },
    {
      title: '10 Tips to Improve Your React App Performance',
      external_link: 'https://frontendfocus.net/performance-tips',
      poste_date: 1715800000,
      author_username: 'reactqueen',
      upvotes: 205,
      downvotes: 10,
      comments: [
        'Tip #4 is gold!',
        'I didn’t know about memoization, thanks!',
        'Any suggestions for large-scale apps?',
      ],
      blog_text:
        'React is fast out of the box, but apps can slow down with scale. These 10 tips will help you optimize render speed, reduce unnecessary re-renders, and keep your UI snappy...',
    },
    {
      title: 'Mastering Git Rebase Like a Pro',
      external_link: 'https://codeflow.org/git-rebase-masterclass',
      poste_date: 1715700000,
      author_username: 'versionctrl',
      upvotes: 76,
      downvotes: 5,
      comments: [
        'What about interactive rebase?',
        'Scary but useful.',
        'Clear and concise!',
      ],
      blog_text:
        'Git rebase is a powerful tool for rewriting commit history. While it can be intimidating, understanding its use cases and how it affects collaboration will level up your Git skills...',
    },
    {
      title: 'Why TypeScript is Worth the Hype',
      external_link: 'https://typedworld.dev/why-typescript',
      poste_date: 1715600000,
      author_username: 'codewizard99',
      upvotes: 180,
      downvotes: 2,
      comments: [
        'Yes! Love TS.',
        'Switched recently, no regrets.',
        'Would like to see some use cases.',
      ],
      blog_text:
        'TypeScript brings static typing to JavaScript, helping catch bugs early and improve developer productivity. In this post, we explore its key benefits and how it improves code quality...',
    },
  ];

  for (let i = 0; i<data.length; ++i) {
    await post_db.create_post({
      author_id: 35,
      external_link: data[i].external_link,
      text: data[i].blog_text,
      title: data[i].title
    });
  }
}

// test();
