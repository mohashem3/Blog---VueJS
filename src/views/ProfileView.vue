<template>
  <div class="container">
    <h3 class="header">My Posts ({{ pagination.total }})</h3>
    <!-- Search bar -->
    <div class="header-container">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search your posts..."
        class="search-input"
      />
    </div>

    <!-- User's Post Cards -->
    <div v-for="post in filteredPosts" :key="post.slug" class="article-card">
      <div class="article-card__img" @click="viewPost(post.slug)">
        <img :src="post.image ? post.image : defaultImage" alt="Post Image" />
      </div>

      <div class="article-card__content">
        <h3 class="article-card__title" @click="viewPost(post.slug)">
          {{ post.title }}
        </h3>
        <p class="article-card__text" @click="viewPost(post.slug)">
          {{ truncateContent(post.content) }}
        </p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>
          <span class="article-card__author">{{ post.user.name }}</span>
        </div>
        <div class="view-more">
          <button @click="viewPost(post.slug)" class="view-more-button">View More</button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button
        v-for="page in pagination.pages"
        :key="page.label"
        @click="changePage(page.url?.split('page=')[1])"
        v-html="page.label"
        :class="{ active: page.active }"
        :disabled="page.active"
      ></button>
    </div>
  </div>

  <!-- Comments Section -->
  <div class="profile-comments-section">
    <h3 class="header">My Comments ({{ commentsPagination.total }})</h3>
    <div v-if="comments.length" class="comments-list">
      <template v-for="comment in comments" :key="comment.id">
        <div class="comment-card">
          <!-- Top right label for Comment/Reply -->
          <!-- <div class="comment-card__header">
            <span class="comment-label">{{ comment.parent_id ? 'Reply' : 'Comment' }}</span>
          </div> -->

          <!-- Comment content -->
          <div class="comment-card__content">
            <p class="comment-card__text">{{ comment.content }}</p>
          </div>
          <div class="comment-card__header">
            <span class="material-symbols-outlined">account_circle</span>
            <span class="comment-card__author">{{ comment.user?.name }}</span>
          </div>
          <!-- Link to original post -->
          <div class="comment-card__footer">
            <router-link :to="`/blog/${comment.post.slug}`" class="view-post-link"
              >View Post</router-link
            >
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Pagination Controls for Comments -->
  <div class="pagination">
    <button
      v-for="page in commentsPagination.pages"
      :key="page.label"
      @click="changeCommentsPage(page.url?.split('page=')[1])"
      v-html="page.label"
      :class="{ active: page.active }"
      :disabled="page.active"
    ></button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import defaultImage from '../assets/img/empty-img.png'
import type { Comment, PostList, Pagination } from '../types/types'

const posts = ref<PostList[]>([])
const searchTerm = ref<string>('')
const pagination = ref<Pagination>({
  prev: null,
  next: null,
  pages: [],
  currentPage: 1,
  lastPage: 1,
  total: 0
})
const commentsPagination = ref<Pagination>({
  prev: null,
  next: null,
  pages: [],
  currentPage: 1,
  lastPage: 1,
  total: 0
})
const currentUserId = ref<number | null>(null)
const router = useRouter()

const comments = ref<Comment[]>([])

// Fetch user's posts
const fetchUserPosts = async (page = 1) => {
  try {
    const token = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    if (!token || !storedUser) return
    const user = JSON.parse(storedUser)
    currentUserId.value = user.id

    const response = await axios.get(`https://interns-blog.nafistech.com/api/posts`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page,
        user_id: currentUserId.value
      }
    })

    const data = response.data
    posts.value = data.data
    pagination.value = {
      prev: data.links.prev,
      next: data.links.next,
      pages: data.meta.links,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      total: data.meta.total
    }
  } catch (error) {
    console.error('Error fetching user posts:', error)
  }
}

// Fetch and store the comments for the logged-in user
const fetchUserComments = async (page = 1) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await axios.get<{ data: Comment[]; links: any; meta: any }>(
      `https://interns-blog.nafistech.com/api/user/comments`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page }
      }
    )

    const data = response.data
    comments.value = data.data // Ensure data includes parent_id
    commentsPagination.value = {
      prev: data.links.prev,
      next: data.links.next,
      pages: data.meta.links,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      total: data.meta.total
    }
  } catch (error) {
    console.error('Error fetching user comments:', error)
  }
}

onMounted(() => {
  fetchUserPosts()
  fetchUserComments()
})

watch(searchTerm, () => {
  fetchUserPosts(pagination.value.currentPage)
})

// Truncate content to fit in the post card
const truncateContent = (content: string, wordLimit = 20) => {
  const words = content.split(' ')
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...'
  }
  return content
}

const viewPost = (slug: string) => {
  router.push({ name: 'BlogView', params: { slug } })
}

// Filter user's posts based on search term
const filteredPosts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return posts.value.filter(
    (post) => post.title.toLowerCase().includes(term) || post.content.toLowerCase().includes(term)
  )
})

// Handle page change for pagination
const changePage = (page: number | string) => {
  if (typeof page === 'string') page = parseInt(page, 10)
  if (page >= 1 && page <= pagination.value.lastPage) {
    fetchUserPosts(page)
  }
}

// Handle page change for comments pagination
const changeCommentsPage = (page: number | string) => {
  if (typeof page === 'string') page = parseInt(page, 10)
  if (page >= 1 && page <= commentsPagination.value.lastPage) {
    fetchUserComments(page)
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center;
  width: 100%; /* Center vertically, if needed */
}

.comment-label {
  margin-bottom: 80px;
}
.comment-card__footer {
  margin-top: auto; /* Push footer to the bottom if needed */
  display: flex;
  justify-content: flex-end; /* Align items to the right */
  position: relative; /* Ensure it does not interfere with absolute positioning */
}

.comment-card__header {
  display: flex;
  align-items: center;
  position: absolute; /* Position relative to the parent */
  bottom: 10px; /* Distance from the bottom */
  left: 10px; /* Distance from the left */
}

.profile-comments-section {
  display: flex;
  flex-direction: column; /* Align items vertically */
  align-items: center; /* Center items horizontally */
  margin-top: 20px;
  margin-bottom: 20px;
}

.comments-list {
  display: flex;
  flex-direction: column; /* Stack comments vertically */
  align-items: center; /* Center comments horizontally */
  width: 100%; /* Allow the list to take full width */
  max-width: 500px; /* Limit the maximum width */
}

.comment-card {
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #5267ff;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.material-symbols-outlined {
  font-size: 25px;
  margin-right: 8px;
}

.comment-card__author {
  font-weight: 500;
}

.comment-card__content {
  margin-top: 0px;
}

.comment-card__text {
  margin-bottom: 10px;
}

.comment-card__actions {
  display: flex;
  gap: 10px;
}

.action-icon {
  cursor: pointer;
}

.show-replies-button {
  text-align: left;
  background: none;
  border: none;
  color: #5267ff;
  cursor: pointer;
  padding: 0px;
  margin-top: 15px;
}

.show-replies-button:hover {
  text-decoration: underline;
  color: #17216d;
}

.highlight-text {
  background-color: #e0f7fa;
}

.header {
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  color: #3186d6;
  margin: 0;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  width: 100%;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 4000,
    'GRAD' 110,
    'opsz' 24;
}

.view-more-button {
  padding: 10px 20px; /* Add some vertical padding */
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 17px;
  display: flex; /* Use flexbox for centering */
  justify-content: center; /* Horizontal center */
  align-items: center; /* Vertical center */
  width: 100%;
  max-width: 110px;
  margin: 5px auto; /* Center buttons and add spacing */
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  color: white;
  text-align: center;
  white-space: nowrap;
  position: absolute;
  top: 10px; /* Distance from the top */
  right: 15px; /* Distance from the right */
}

.view-more-button:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
  color: white;
}

/* Flex container for action icons */
.post-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Container for edit, delete, and comment icons */
.edit-delete-comment {
  display: flex;
  align-items: center; /* Ensures icons are aligned vertically in the center */
  margin-bottom: 10px; /* Space between action icons and likes section */
}

/* Style for individual icons */
.edit-icon {
  cursor: pointer;
  margin-right: 20px; /* Space between icons */
  display: inline-flex; /* Ensures the icons are inline and aligned properly */
  align-items: center; /* Aligns the icons vertically */
}

.delete-icon {
  cursor: pointer;
  margin-right: 20px; /* Space between icons */
  margin-top: 6px;
  display: inline-flex; /* Ensures the icons are inline and aligned properly */
  align-items: center; /* Aligns the icons vertically */
  transition: transform 0.3s ease; /* Smooth transition */
}

.delete-icon:hover {
  transform: scale(1.2); /* Increase size on hover */
}

.comments-count {
  font-size: 15px;
  color: #555;
}

/* Container for heart icon and count */
.likes {
  display: flex;
  align-items: center;
}

/* Style for heart icon */
.like-icon {
  cursor: pointer;
  color: red;
  font-size: 24px; /* Adjust size as needed */
  margin-right: 6px; /* Space between icon and count */
}

.likes-count {
  font-size: 15px;
  color: #555;
  margin-top: 500px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-input {
  width: 100%;
  max-width: 400px;

  padding: 15px;
  border: 1px solid #3186d6;
  border-radius: 25px;
}

.search-input:active {
  border: 1px solid #3314e2;
}

.sort-container {
  position: absolute;
  left: 0; /* Align the sorting dropdown to the right */
  display: flex;
  align-items: center;
  padding-left: 150px;
}

.sort-container label {
  margin-right: 10px;
}

.sort-container select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #3186d6;
}

.comments-section {
  display: flex;
  align-items: center;
}

.comments-count {
  font-size: 15px;
  margin-top: 12px;
  color: #555;
  align-self: center;
}

.new-post-button {
  position: absolute;
  right: 0;
  background-color: #ff4081;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-right: 150px;
  width: 170px; /* Set a fixed width */
  text-align: center; /* Center the text */
  overflow: hidden; /* Prevent text overflow */
  white-space: nowrap; /* Prevent text wrapping */
}

.new-post-button:hover {
  background-color: #02c0cc;
}

.my-post-button {
  position: absolute;
  right: 0;
  background-color: #ff4081;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-right: 980px;
  width: 170px; /* Set a fixed width */
  text-align: center; /* Center the text */
  overflow: hidden; /* Prevent text overflow */
  white-space: nowrap; /* Prevent text wrapping */
}

.my-post-button:hover {
  background-color: #02c0cc;
}

.article-card {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 900px;
  height: 230px;
  margin: 15px auto;
  background: #fff;
  box-shadow: 0px 14px 80px rgba(119, 125, 231, 0.277);
  border-radius: 25px;
  overflow: hidden;
  padding: 20px;
  border: 0px solid #3186d6; /* Blue border */
  position: relative;
}

.article-card__img {
  cursor: pointer;
  width: 25%;
  height: 200px;
  overflow: hidden;
  margin-right: 30px;
}

.article-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px;
}

.article-card__content {
  width: 75%;
  padding: 0;
}

.article-card__title {
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  color: #0d0925;
  margin-bottom: 10px;
}

.article-card__text {
  cursor: pointer;
  color: #4e4a67;
  margin-bottom: 15px;
  line-height: 1.5em;
}

.article-card__author {
  display: block;
  color: #7b7992;
  font-weight: 500;
}

.user {
  display: flex;
  margin-top: auto;
}

/* Pagination Styling */
.pagination {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.pagination button {
  color: #3186d6;
  padding: 8px 16px;
  margin: 0 4px;
  border: 1px solid #3186d6;
  border-radius: 5px;
  background-color: transparent;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.pagination button.active {
  background-color: #3186d6;
  color: #fff;
  border: 1px solid #3186d6;
}

.pagination button:hover:not(.active) {
  background-color: #3186d6;
  color: #fff;
}

.pagination button:disabled {
  background-color: #3186d6;
  color: #fff;
  cursor: not-allowed;
}
.edit-icon {
  cursor: pointer; /* Change cursor to pointer */
  transition: transform 0.3s ease; /* Smooth transition for hover effect */
  margin-top: 10px;
  margin-right: 20px;
  color: #77f5ff;
}

.edit-icon:hover {
  transform: scale(1.3); /* Slightly enlarge on hover */
}

.comment-icon {
  margin-top: 10px;
  margin-right: 8px;
  width: 20px;
  height: 20px;
}

.button-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
  fill: #fff;
}
</style>
