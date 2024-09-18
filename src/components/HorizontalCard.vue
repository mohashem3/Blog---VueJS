<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import addIcon from '../assets/img/add-icon.svg'
import commentIcon from '../assets/img/comment-icon.svg'
import defaultImage from '../assets/img/empty-img.png'
import { useRouter } from 'vue-router'
import AddPost from './AddPost.vue'
import type { PostList, PostListResponse, Pagination } from '../types/types'

const latestPostsTitle = computed(() => `Latest Posts (${totalPostsCount.value})`)

const articles = ref<PostList[]>([])
const currentPost = ref<PostList | null>(null)
const currentUserId = ref<number>() // Ref to store the current user ID
const showAddPostPopup = ref<boolean>(false)
const mode = ref<'add' | 'edit'>('add')

const totalPostsCount = ref<number>(0)
const searchTerm = ref<string>('')
const sortOption = ref<'latest' | 'oldest'>('latest')
const router = useRouter()

const pagination = ref<Pagination>({
  prev: null,
  next: null,
  pages: [],
  currentPage: 1,
  lastPage: 1,
  total: 0
})

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  sortOption.value = target.value as 'latest' | 'oldest'
  fetchArticles(pagination.value.currentPage)
}

const filteredArticles = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return articles.value.filter(
    (article) =>
      article.title.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term) ||
      article.user.name.toLowerCase().includes(term)
  )
})

const fetchArticles = async (page: number = 1) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    const response = await axios.get<PostListResponse>(
      `https://interns-blog.nafistech.com/api/posts`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page,
          sort: sortOption.value === 'latest' ? 'desc' : 'asc',
          search: searchTerm.value
        }
      }
    )

    const data = response.data
    console.log('Fetched data:', data)

    articles.value = data.data
    pagination.value = {
      prev: data.links.prev,
      next: data.links.next,
      pages: data.meta.links,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      total: data.meta.total
    }
    totalPostsCount.value = data.meta.total
  } catch (error) {
    console.error('Error fetching articles:', error)
  }
}

const truncateContent = (content: string, wordLimit = 20) => {
  const words = content.split(' ') // Split the content into an array of words
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...' // Join the first 80 words and add "..."
  }
  return content // Return the full content if it's less than 80 words
}

const viewArticle = (slug: string) => {
  router.push({ name: 'BlogView', params: { slug } })
}

const toggleLike = async (article: PostList) => {
  if (article) {
    article.liked_by_user = !article.liked_by_user
    article.likes_count += article.liked_by_user ? 1 : -1

    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.post(
        `https://interns-blog.nafistech.com/api/posts/like/${article.slug}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log('Like response:', response.data)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }
}

const openAddPostPopup = () => {
  currentPost.value = null // Reset currentPost to ensure the form is cleared
  mode.value = 'add' // Set the mode to 'add'
  showAddPostPopup.value = true
}

const openEditPostPopup = (slug: string) => {
  const article = articles.value.find((a) => a.slug === slug)
  if (article) {
    currentPost.value = article // Load the selected article for editing
    mode.value = 'edit' // Set the mode to 'edit'
    showAddPostPopup.value = true
  }
}

const handlePostAdded = () => {
  // Handle logic after adding post
  fetchArticles(pagination.value.currentPage)
}

const isPostOwner = (postUserId: number) => {
  return postUserId === currentUserId.value
}

const deletePost = async (slug: string) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      const response = await axios.delete(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        Swal.fire('Deleted!', 'Your post has been deleted.', 'success')
        fetchArticles(pagination.value.currentPage)
      } else {
        throw new Error('Failed to delete the post.')
      }
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    Swal.fire('Error', 'Failed to delete the post.', 'error')
  }
}

const changePage = (page: number | string) => {
  if (typeof page === 'string') {
    page = parseInt(page, 10)
  }
  if (page >= 1 && page <= pagination.value.lastPage) {
    fetchArticles(page)
  }
}

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    currentUserId.value = user.id
  }
  fetchArticles()
})

watch(searchTerm, () => {
  fetchArticles(pagination.value.currentPage)
})

watch(sortOption, () => {
  fetchArticles(pagination.value.currentPage)
})
</script>

<template>
  <div class="container">
    <!-- Header and Buttons -->
    <div class="header-container">
      <h2 class="header">{{ latestPostsTitle }}</h2>
    </div>

    <div class="header-container">
      <!-- Sorting Dropdown -->
      <div class="sort-container">
        <label for="sort-order">Sort by:</label>
        <select v-model="sortOption" @change="handleSortChange">
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search articles..."
        class="search-input"
      />

      <button class="new-post-button" @click="openAddPostPopup">
        <img :src="addIcon" alt="Add Post Icon" class="button-icon" />
        New Post
      </button>
    </div>

    <!-- Article Cards -->
    <div v-for="article in filteredArticles" :key="article.slug" class="article-card">
      <div class="article-card__img" @click="viewArticle(article.slug)">
        <img :src="article.image ? article.image : defaultImage" alt="Article Image" />
      </div>

      <div class="article-card__content">
        <h3 class="article-card__title" @click="viewArticle(article.slug)">{{ article.title }}</h3>
        <p class="article-card__text" @click="viewArticle(article.slug)">
          {{ truncateContent(article.content) }}
        </p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>
          <span class="article-card__author">{{ article.user.name }}</span>
        </div>
        <div class="view-more">
          <button @click="viewArticle(article.slug)" class="view-more-button">View More</button>
        </div>
        <div class="post-actions">
          <div class="edit-delete-comment">
            <img
              v-if="isPostOwner(article.user.id)"
              @click.stop="openEditPostPopup(article.slug)"
              width="18"
              height="18"
              src="https://img.icons8.com/metro/26/000000/edit.png"
              alt="edit"
              class="edit-icon"
            />
            <img
              v-if="isPostOwner(article.user.id)"
              @click.stop="deletePost(article.slug)"
              width="18"
              height="18"
              src="https://img.icons8.com/metro/26/000000/delete.png"
              alt="delete"
              class="delete-icon"
            />
            <img
              :src="commentIcon"
              alt="Comment Icon"
              class="comment-icon"
              width="20"
              height="20"
            />
            <span class="comments-count">{{ article.comments_count }}</span>
          </div>
          <!-- Heart Icon for Likes -->
          <div class="likes">
            <span @click="toggleLike(article)" class="like-icon">
              <img
                :src="
                  article.liked_by_user
                    ? 'https://img.icons8.com/?size=100&id=yUGu5KXHNq3O&format=png&color=FF0000'
                    : 'https://img.icons8.com/ios/50/like--v1.png'
                "
                width="32"
                height="32"
                alt="like-icon"
              />
            </span>
            <span class="like-count">
              {{ article.likes_count }}
            </span>
          </div>
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

    <!-- Add Post Form Popup -->
    <AddPost
      :showPopup="showAddPostPopup"
      :postData="currentPost"
      @update:showPopup="showAddPostPopup = false"
      @post-added="handlePostAdded"
    />
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 4000,
    'GRAD' 110,
    'opsz' 24;
}

.header {
  font-size: 32px;
  font-weight: bold;
  color: #3186d6;
  margin: 0;
}

.latest-comment {
  background-color: #b1f8ff;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
}

.latest-comment__title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.latest-comment__text {
  font-size: 14px;
  margin-bottom: 10px;
}

.latest-comment__user-info {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.latest-comment__user-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}

.latest-comment__user-name {
  font-size: 12px;
  font-weight: bold;
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
  max-width: 1000px;
  height: 350px;
  margin: 30px auto;
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
