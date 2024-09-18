export interface Register {
  email: string
  name: string
  password: string
  password_confirmation: string
}

export interface Login {
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  content: string
  created_at?: string // Optional when creating a comment
  created_at_readable?: string // Optional when creating a comment
  user: User // Optional when creating a comment
  children?: Comment[] // Optional when creating a comment
  parent_id?: number // Optional when creating a comment
  post: {
    // Add this block for the post reference
    id: number
    slug: string
    title: string
    content: string
    comments_count: number
    created_at: string
    created_at_readable: string
    updated_at: string
    updated_at_readable: string
    image: string
    image_thumb: string
    user: User
  }
}

export interface Like {
  id: number
  name: string
}

export interface PostList {
  id: number
  slug: string
  title: string
  content: string
  comments_count: number
  created_at: string
  created_at_readable: string
  updated_at: string
  updated_at_readable: string
  image: string
  image_thumb: string
  user: User
  comments: Comment[]
  last_comment?: Comment | null
  likes_count: number
  liked_by_user: boolean
  likes: Like[]
}

export interface PaginationPage {
  url: string
  label: string
  active: boolean
}

export interface Pagination {
  prev: string | null
  next: string | null
  pages: PaginationPage[]
  currentPage: number
  lastPage: number
  total: number
}

export const defaultPagination: Pagination = {
  prev: null,
  next: null,
  pages: [],
  currentPage: 1,
  lastPage: 1,
  total: 0
}

export interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: PaginationPage[]
}

// API response for list of posts (with pagination)
export interface PostListResponse {
  data: PostList[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: Meta
}
