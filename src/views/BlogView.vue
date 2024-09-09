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
          v-if="isPostOwner(post.authorId)"
          @click.stop="openEditPostPopup"
          width="18"
          height="18"
          src="https://img.icons8.com/metro/26/000000/edit.png"
          alt="edit"
          class="edit-icon"
        />
        <img
          v-if="isPostOwner(post.authorId)"
          @click.stop="deletePost(post.slug)"
          width="21"
          height="21"
          src="https://img.icons8.com/windows/32/000000/trash.png"
          alt="trash"
          class="edit-icon"
        />
        <img
          @click="toggleCommentSection(post.slug)"
          :src="commentIcon"
          alt="Comment Icon"
          class="comment-icon"
        />
        <span class="comments-count">{{ post.commentsCount }}</span>
      </div>

      <!-- Heart Icon for Likes -->
      <div class="likes">
        <span @click="toggleLike(post)" class="like-icon">
          <i
            :class="{
              'fa-solid fa-heart': post.liked_by_user,
              'fa-regular fa-heart': !post.liked_by_user
            }"
          ></i>
        </span>
        <span class="like-count" @click.prevent="toggleLikesListPopup">
          {{ post.likes_count }}
        </span>
      </div>

      <div class="article-card__img">
        <img :src="post.image" alt="Article Image" />
      </div>
      <div class="article-card__content">
        <p class="article-card__text">{{ post.content }}</p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>
          <span class="article-card__author">{{ post.author }}</span>
        </div>
      </div>
    </div>

    <!-- AddPost Popup -->
    <AddPost
      :showPopup="showAddPostPopup"
      :postData="currentPost"
      :mode="mode"
      @update:showPopup="showAddPostPopup = $event"
      @postUpdated="fetchPost"
    />

    <!-- CommentSection Popup -->
    <CommentSection
      :isOpen="isCommentSectionOpen"
      :slug="activeSlug"
      @close="closeCommentSection"
      @commentAdded="fetchPost"
    />

    <LikesList
      :showPopup="showLikesListPopup"
      :likes="post.likeslist"
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

const router = useRouter()
const route = useRoute()

const post = ref({
  image: '',
  commentsCount: 0,
  author: '',
  authorId: 0,
  likes_count: 0,
  liked_by_user: false,
  likeslist: [] // Initialize as an empty array
})
const showAddPostPopup = ref(false)
const mode = ref<'add' | 'edit'>('add')
const currentPost = ref<any>(null)
const isCommentSectionOpen = ref(false)
const activeSlug = ref<string | null>(null)
const currentUserId = ref<string>('')

const showLikesListPopup = ref(false)

const toggleLikesListPopup = () => {
  showLikesListPopup.value = !showLikesListPopup.value
}

const toggleLike = async (post: { slug: string; liked_by_user: boolean; likes_count: number }) => {
  if (post) {
    // Optimistically update the like state
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

      // Check if the response status is not OK
      if (response.status !== 200) {
        // Revert the like state if there's an error
        post.liked_by_user = !post.liked_by_user
        post.likes_count += post.liked_by_user ? -1 : 1
        console.error('Error toggling like: Unexpected response status', response.status)
      }
    } catch (error) {
      // Revert the like state if there's an error
      post.liked_by_user = !post.liked_by_user
      post.likes_count += post.liked_by_user ? -1 : 1
      console.error('Error toggling like:', error)
    }
  }
}

const fetchPost = async () => {
  try {
    const slug = route.params.slug as string
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    // Fetch current user
    const userResponse = await axios.get('https://interns-blog.nafistech.com/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
    currentUserId.value = userResponse.data.id

    // Fetch post details
    const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    post.value = {
      ...response.data.data,
      image: response.data.data.image, // Use thumbnail image for smaller view
      commentsCount: response.data.data.comments_count,
      author: response.data.data.user.name, // Author's name
      authorId: response.data.data.user.id, // Author's ID for ownership check
      likes_count: response.data.data.likes_count, // Mapped likes count
      liked_by_user: response.data.data.liked_by_user, // Mapped liked by user
      likeslist: response.data.data.likes
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    Swal.fire('Error!', 'Failed to fetch the post. Please try again.', 'error')
  }
}

const isPostOwner = (authorId: string) => {
  return authorId === currentUserId.value
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
      console.error('Error deleting post:', error)
      Swal.fire('Error!', 'Failed to delete the post. Please try again.', 'error')
    }
  }
}

const toggleCommentSection = (slug: string) => {
  activeSlug.value = slug
  isCommentSectionOpen.value = !isCommentSectionOpen.value
}

const closeCommentSection = () => {
  isCommentSectionOpen.value = false
}

const postTitle = computed(() => `Post Details`)

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
  margin-left: 12px;
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
  margin-right: 3px; /* Add space between icon and count */
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
  margin-left: 20px;
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
  width: 100%;

  object-fit: cover;
  border-radius: 8px;
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
  margin-right: 10px;
  cursor: pointer;
}

.comment-icon {
  margin-right: 10px;
  cursor: pointer;
}

.comments-count {
  font-weight: bold;
}
</style>
