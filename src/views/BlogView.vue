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

const router = useRouter()
const route = useRoute()

const post = ref<any>(null)
const showAddPostPopup = ref(false)
const mode = ref<'add' | 'edit'>('add')
const currentPost = ref<any>(null)
const isCommentSectionOpen = ref(false)
const activeSlug = ref<string | null>(null)
const currentUserId = ref<string>('')

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
      authorId: response.data.data.user.id // Author's ID for ownership check
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
