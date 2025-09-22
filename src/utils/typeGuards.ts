import { UserInfo, StoryPage, APIResponse } from '@/types/api';

export const isUserInfo = (obj: any): obj is UserInfo => {
  return typeof obj === 'object' && obj !== null;
};

export const isStoryPage = (obj: any): obj is StoryPage => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.pageNumber === 'number'
  );
};

export const isAPIResponse = (obj: any): obj is APIResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean'
  );
};

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};