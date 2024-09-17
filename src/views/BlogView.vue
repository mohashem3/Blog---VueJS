<template>
  <div class="container">
    <!-- Header and Buttons -->
    <div class="header-container">
      <h2 class="header">{{ postTitle }}</h2>
    </div>

    <!-- Article Card -->
    <div v-if="post" class="article-card">
      <h3 class="article-card__title">{{ post.title }}</h3>
      <div class="post-actions">
        <img
          v-if="isPostOwner(post.user.id)"
          @click.stop="openEditPostPopup"
          width="21"
          height="21"
          src="https://img.icons8.com/metro/26/000000/edit.png"
          alt="edit"
          class="edit-icon"
        />
        <img
          v-if="isPostOwner(post.user.id)"
          @click.stop="deletePost(post.slug)"
          width="26"
          height="26"
          src="https://img.icons8.com/windows/32/000000/trash.png"
          alt="trash"
          class="delete-icon"
        />
        <img
          @click="toggleLikesListPopup"
          :src="commentIcon"
          alt="Comment Icon"
          class="comment-icon"
        />
        <span class="comments-count" @click="toggleLikesListPopup">
          {{ totalCommentsCount }}
        </span>
      </div>
      <!-- Heart Icon for Likes -->
      <div class="likes">
        <span @click="toggleLike(post)" class="like-icon">
          <img
            :src="
              post.liked_by_user
                ? 'https://img.icons8.com/?size=100&id=yUGu5KXHNq3O&format=png&color=FF0000'
                : 'https://img.icons8.com/ios/50/like--v1.png'
            "
            width="32"
            height="32"
            alt="like-icon"
          />
        </span>
        <span class="like-count" @click.prevent="toggleLikesListPopup">
          {{ post.likes_count }}
        </span>
      </div>

      <div class="article-card__img">
        <img :src="post.image ? post.image : defaultImage" alt="Article Image" />
      </div>
      <div class="article-card__content">
        <p class="article-card__text">{{ post.content }}</p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>
          <span class="article-card__author">{{ post.user.name }}</span>
        </div>
      </div>
    </div>

    <!-- AddPost Popup -->
    <AddPost
      :showPopup="showAddPostPopup"
      :postData="currentPost"
      :mode="mode"
      @update:showPopup="showAddPostPopup = $event"
      @post-added="fetchPost"
    />

    <CommentSection
      :comments="post ? post.comments : []"
      :slug="post ? post.slug : ''"
      :postOwnerId="post ? post.user.id : 0"
      :fetchPost="fetchPost"
      :totalCommentsCount="totalCommentsCount"
    />

    <!-- LikesList Popup -->
    <LikesList
      :showPopup="showLikesListPopup"
      :likes="updatedLikes"
      @update:showPopup="showLikesListPopup = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import AddPost from '../components/AddPost.vue'
import CommentSection from '../components/CommentSection.vue'
import commentIcon from '../assets/img/comment-icon.svg'
import { useRouter, useRoute } from 'vue-router'
import LikesList from '@/components/LikesList.vue'
import defaultImage from '../assets/img/empty-img.png'

// Import interfaces from types.ts
import type { PostList, Comment, Like } from '../types/types'

const post = ref<PostList | null>(null)
const showAddPostPopup = ref(false)
const mode = ref<'add' | 'edit'>('add')
const currentPost = ref<PostList | null>(null)
const showLikesListPopup = ref(false)
const router = useRouter()
const route = useRoute()

// Likes array to store the list of users who liked the post
const updatedLikes = ref<Like[]>([])

// Retrieve user object from local storage
const userFromStorage = localStorage.getItem('user')
const currentUser = ref(userFromStorage ? JSON.parse(userFromStorage) : null)

const fetchPost = async () => {
  try {
    const slug = route.params.slug as string
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    // Fetch post details
    const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Assuming response.data.data matches PostList
    const postData: PostList = response.data.data
    post.value = postData
    updatedLikes.value = postData.likes
  } catch (error) {
    console.error('Error fetching post:', (error as Error).message)
    Swal.fire('Error!', 'Failed to fetch the post. Please try again.', 'error')
  }
}

const isPostOwner = (authorId: number) => {
  return authorId === (currentUser.value ? currentUser.value.id : -1)
}

const openEditPostPopup = () => {
  if (post.value) {
    currentPost.value = post.value
    mode.value = 'edit'
    showAddPostPopup.value = true
  }
}

const deletePost = async (slug: string) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  })

  if (isConfirmed) {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }

      await axios.delete(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      Swal.fire('Deleted!', 'Your post has been deleted.', 'success')
      router.push('/')
    } catch (error) {
      console.error('Error deleting post:', (error as Error).message)
      Swal.fire('Error!', 'Failed to delete the post. Please try again.', 'error')
    }
  }
}

// Count all comments including replies recursively
const totalCommentsCount = computed(() => {
  const countComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.children ? countComments(comment.children) : 0)
    }, 0)
  }
  return post.value ? countComments(post.value.comments) : 0
})

const toggleLike = async (post: PostList) => {
  if (!post || !currentUser.value) return

  // Optimistically update the like state
  const previousLikedState = post.liked_by_user
  const previousLikesCount = post.likes_count

  post.liked_by_user = !post.liked_by_user
  post.likes_count += post.liked_by_user ? 1 : -1

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    // Send request to the server to toggle the like
    const response = await axios.post(
      `https://interns-blog.nafistech.com/api/posts/like/${post.slug}`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (response.status !== 200) {
      throw new Error('Failed to toggle like')
    }

    // Update the likes array if the like state changes successfully
    if (post.liked_by_user) {
      updatedLikes.value.push(currentUser.value)
    } else {
      updatedLikes.value = updatedLikes.value.filter((like) => like.id !== currentUser.value.id)
    }
  } catch (error) {
    // Revert the UI changes if the API call fails
    post.liked_by_user = previousLikedState
    post.likes_count = previousLikesCount

    console.error('Error toggling like:', (error as Error).message)
    Swal.fire('Error!', 'Failed to toggle the like. Please try again.', 'error')
  }
}

const postTitle = computed(() => `Post Details`)

const toggleLikesListPopup = () => {
  showLikesListPopup.value = !showLikesListPopup.value
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Style for the like icon container */
.likes {
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 0px;
  display: flex;
  align-items: center;
}

.like-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.like-icon i {
  font-size: 24px; /* Adjust size as needed */
  position: relative;
  margin-right: 0px; /* Add space between icon and count */
}

.like-icon i::before {
  content: '\f004'; /* Font Awesome heart icon code */
  font-family: 'Font Awesome 5 Free'; /* Ensure Font Awesome font is used */
  font-weight: 900; /* Use solid weight */
  color: #eeafaf; /* Default color when not liked */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-icon i.fa-solid::before {
  color: red; /* Color when liked */
}

.like-icon i.fa-regular::before {
  color: #ccc; /* Color when not liked */
}

.like-icon i:hover::before {
  color: darkred; /* Color on hover */
}

/* Style for the like count */
.like-count {
  cursor: pointer;
  font-size: 16px; /* Adjust font size as needed */
  color: #333; /* Adjust text color as needed */
  margin-left: 8px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header {
  font-size: 24px;
  font-weight: bold;
}

.article-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.article-card__img img {
  width: 100%; /* Ensure the image fills the width of its container */
  max-width: 100%; /* Prevent the image from growing beyond its container width */
  max-height: 300px; /* Set a maximum height to prevent excessively tall images */
  object-fit: cover; /* Ensure the image covers the container without stretching */
  border-radius: 8px; /* Match the border radius of the card */
  margin-bottom: 15px; /* Space between image and content */
}

.article-card__content {
  margin-top: 10px;
}

.article-card__title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.article-card__text {
  font-size: 16px;
  margin: 0 0 10px 0;
}

.user {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.article-card__author {
  margin-left: 5px;
}

.post-actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.edit-icon {
  margin-right: 25px;
  cursor: pointer;
}

.delete-icon {
  margin-right: 25px;
  cursor: pointer;
  margin-bottom: 3px;
}

.edit-icon:hover {
  transform: scale(1.1); /* Increase size on hover */
}

.delete-icon:hover {
  transform: scale(1.1); /* Increase size on hover */
}

.comment-icon {
  margin-right: 10px;
  cursor: pointer;
}

.comments-count {
  cursor: pointer;

  color: black;
}
</style>
