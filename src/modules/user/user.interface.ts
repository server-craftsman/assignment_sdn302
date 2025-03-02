import { Document } from 'mongoose';
import { UserRoleEnum } from './user.enum';

export type UserRole = '' | UserRoleEnum.ADMIN | UserRoleEnum.INSTRUCTOR | UserRoleEnum.STUDENT;

export interface IUser extends Document {
    _id: string;
    name: string; // required
    email: string; // unique
    password?: string;
    role: UserRole; // default is "student"
    description?: string; // required if role is instructor
    phone_number?: string; // default empty
    avatar_url?: string; // url
    dob?: Date; // date of birth, default new Date()
    access_token?: string;
    refresh_token?: string;
    token_version: number; // default 0
    user_id?: string; // default empty
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
}