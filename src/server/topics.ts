import { CreatePostValidationError } from '@/db/post';
import { MyError } from './types';

type SA_CreateTopicState = {title: string} | MyError | CreatePostValidationError;

export async function SA_CreateTopic(
  old_state: SA_CreateTopicState,
  orm_data: FormData
): Promise<SA_CreateTopicState> {
  
  return {error_code: 2000, error_message: ""};
}
