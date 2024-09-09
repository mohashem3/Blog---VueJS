<template>
  <div class="container">
    <!-- Header and Buttons -->
    <div class="header-container">
      <h2 class="header">{{ latestPostsTitle }}</h2>

      <!-- Sorting Dropdown -->
      <div class="sort-container">
        <label for="sort-order">Sort by:</label>
        <select v-model="sortOption" @change="fetchArticles">
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>

    <div class="header-container">
      <button class="filter-posts-button my-post-button" @click="togglePostsFilter">
        <img :src="myPostIcon" alt="My Posts Icon" class="button-icon" />
        {{ filterButtonWithCount }}
      </button>

      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search articles..."
        class="search-input"
        @input="debouncedFetchArticles"
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
        <p class="article-card__text" @click="viewArticle(article.slug)">{{ article.content }}</p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>

          <span class="article-card__author">{{ article.author }}</span>
        </div>
        <div class="post-actions">
          <img
            v-if="isPostOwner(article.authorId)"
            @click.stop="openEditPostPopup(article.slug)"
            width="18"
            height="18"
            src="https://img.icons8.com/metro/26/000000/edit.png"
            alt="edit"
            class="edit-icon"
          />
          <img
            v-if="isPostOwner(article.authorId)"
            @click.stop="deletePost(article.slug)"
            width="21"
            height="21"
            src="https://img.icons8.com/windows/32/000000/trash.png"
            alt="trash"
            class="edit-icon"
          />
          <!-- <span class="comments"> -->
          <img :src="commentIcon" alt="Comment Icon" class="comment-icon" />
          <span class="comments-count">{{ article.commentsCount }}</span>
          <!-- </span> -->
        </div>
        <!-- Heart Icon for Likes -->
        <div class="likes">
          <span @click="toggleLike(article)" class="like-icon">
            <i
              :class="{
                'fa-solid': article.liked_by_user,
                'fa-regular': !article.liked_by_user
              }"
            ></i>
          </span>
          <span class="like-count">{{ article.likes_count }}</span>
        </div>
        <!-- Separator Line -->
        <hr class="separator-line" />

        <!-- Latest Comment Section -->

        <div class="latest-comment" v-if="article.lastComment">
          <p class="latest-comment__title"><strong>Latest Comment</strong></p>
          <p class="latest-comment__text">{{ article.lastComment }}</p>
          <div class="user">
            <span class="material-symbols-outlined"> account_circle </span>
            <span class="article-card__author">{{ article.lastCommentAuthor }}</span>
          </div>
        </div>
      </div>
      <!-- View More Button -->
      <div class="view-more">
        <button @click="viewArticle(article.slug)" class="view-more-button">View More</button>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
      <a href="#" v-if="pagination.prev" @click.prevent="changePage('prev')"> Previous </a>
      <a
        v-for="page in pagination.pages"
        :key="page.number"
        :class="{ active: page.isActive }"
        href="#"
        @click.prevent="fetchArticles(page.url)"
      >
        {{ page.label }}
      </a>
      <a href="#" v-if="pagination.next" @click.prevent="changePage('next')"> Next </a>
    </div>

    <!-- AddPost Popup -->
    <AddPost
      :showPopup="showAddPostPopup"
      :postData="currentPost"
      :mode="mode"
      @update:showPopup="showAddPostPopup = $event"
    />

    <!-- CommentSection Popup -->
    <CommentSection
      :isOpen="isCommentSectionOpen"
      :slug="activeSlug"
      @close="closeCommentSection"
    />

    <!-- LikesList Popup -->
    <LikesList
      :showPopup="showLikesListPopup"
      @update:showPopup="showLikesListPopup = $event"
      :articleId="currentArticleId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import AddPost from '../components/AddPost.vue'
import addIcon from '../assets/img/add-icon.svg'
import myPostIcon from '../assets/img/myposts-icon.svg'
import commentIcon from '../assets/img/comment-icon.svg'
import CommentSection from './CommentSection.vue'
import { useRouter } from 'vue-router'
import defaultImage from '../assets/img/empty-img.png'
import LikesList from './LikesList.vue'

const debounce = (func: Function, delay: number) => {
  let timeoutId: number | undefined
  return (...args: any[]) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => func(...args), delay)
  }
}

const debouncedFetchArticles = debounce(() => {
  fetchArticles()
}, 500)

const router = useRouter()

const viewArticle = (slug: string) => {
  router.push({ name: 'BlogView', params: { slug } })
}

const props = defineProps({
  showOnlyMyBlogs: {
    type: Boolean,
    default: false
  }
})

const showLikesListPopup = ref(false)
const articles = ref([])
const currentPost = ref(null)
const currentPage = ref(1)
const articlesPerPage = 15
const pagination = ref({
  prev: null,
  next: null,
  pages: []
})
const currentUserId = ref('')
const showAddPostPopup = ref(false)
const mode = ref<'add' | 'edit'>('add')
const showMyPosts = ref(false)
const isCommentSectionOpen = ref(false)
const activeSlug = ref(null)
const totalPostsCount = ref(0)
const myPostsCount = ref(0)
const searchTerm = ref('')
const sortOption = ref('latest')

// Load page from localStorage or set default to 1
const loadPageFromStorage = () => {
  const savedPage = localStorage.getItem('currentPage')
  currentPage.value = savedPage ? parseInt(savedPage, 10) : 1
}

const savePageToStorage = (page: number) => {
  localStorage.setItem('currentPage', page.toString())
}

const toggleLikesListPopup = () => {
  showLikesListPopup.value = !showLikesListPopup.value
}

const toggleCommentSection = (slug: string) => {
  activeSlug.value = slug
  isCommentSectionOpen.value = !isCommentSectionOpen.value
}

const closeCommentSection = () => {
  isCommentSectionOpen.value = false
}

const toggleLike = async (article: {
  slug: string
  liked_by_user: boolean
  likes_count: number
}) => {
  if (article) {
    // Optimistically update the like state
    article.liked_by_user = !article.liked_by_user
    article.likes_count += article.liked_by_user ? 1 : -1

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }

      // Send request to the server to toggle the like
      const response = await axios.post(
        `https://interns-blog.nafistech.com/api/posts/like/${article.slug}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Check if the response status is not OK
      if (response.status !== 200) {
        // Revert the like state if there's an error
        article.liked_by_user = !article.liked_by_user
        article.likes_count += article.liked_by_user ? -1 : 1
        console.error('Error toggling like: Unexpected response status', response.status)
      }
    } catch (error) {
      // Revert the like state if there's an error
      article.liked_by_user = !article.liked_by_user
      article.likes_count += article.liked_by_user ? -1 : 1
      console.error('Error toggling like:', error)
    }
  }
}

const fetchArticles = async (pageUrl?: string, attempt = 1) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    const userResponse = await axios.get('https://interns-blog.nafistech.com/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
    currentUserId.value = userResponse.data.id

    // Use pageUrl if provided, otherwise use the built URL
    const url = pageUrl || buildURL()
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    articles.value = response.data.data.map((article: any) => ({
      articleId: article.id,
      title: article.title,
      content: article.content.substring(0, 70) + '...',
      author: article.user.name,
      slug: article.slug,
      authorId: article.user.id,
      commentsCount: article.comments_count,
      lastComment: article.last_comment ? article.last_comment.content : '',
      lastCommentAuthor: article.last_comment ? article.last_comment.user.name : '',
      image: article.image_thumb || defaultImage, // Use defaultImage if no image is provided
      likes_count: article.likes_count,
      liked_by_user: article.liked_by_user
    }))

    myPostsCount.value = articles.value.filter(
      (article) => article.authorId === currentUserId.value
    ).length
    totalPostsCount.value = response.data.meta.total

    // Update pagination information
    pagination.value = {
      prev: response.data.links.prev || null,
      next: response.data.links.next || null,
      pages: response.data.meta.links
        .filter((link: any) => !isNaN(parseInt(link.label))) // Ensure label is parsed as an integer
        .map((link: any) => ({
          number: parseInt(link.label),
          url: link.url,
          isActive: link.active,
          label: link.label
        }))
    }

    currentPage.value = response.data.meta.current_page
    savePageToStorage(currentPage.value) // Save current page to localStorage
  } catch (error) {
    if (error.response?.status === 429 && attempt < 5) {
      // Retry after delay if rate limit is hit
      const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
      console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`)
      setTimeout(() => fetchArticles(pageUrl, attempt + 1), delay)
      // } else {
      //   // Display a user-friendly error message
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Oops...',
      //     text: 'Something went wrong while fetching articles. Please try again later.'
      //   })
      console.error('Error fetching articles:', error)
    }
  }
}

const buildURL = () => {
  const baseURL = 'https://interns-blog.nafistech.com/api/posts'
  const sortOrder = sortOption.value === 'latest' ? 'desc' : 'asc'
  const params = new URLSearchParams({
    page: currentPage.value.toString(),
    sort: sortOrder,
    search: searchTerm.value
  })
  return `${baseURL}?${params.toString()}`
}

// Watch for changes in sortOption and searchTerm and fetch articles accordingly
watch([sortOption, searchTerm], () => {
  debouncedFetchArticles()
})

// Function to change the page
const changePage = (direction: 'prev' | 'next') => {
  const pageUrl = direction === 'prev' ? pagination.value.prev : pagination.value.next
  if (pageUrl) {
    fetchArticles(pageUrl)
  }
}

const isPostOwner = (authorId: string) => {
  return authorId === currentUserId.value
}

const openAddPostPopup = () => {
  currentPost.value = null
  mode.value = 'add'
  showAddPostPopup.value = true
}

const openEditPostPopup = async (slug: string) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    currentPost.value = response.data.data
    mode.value = 'edit'
    showAddPostPopup.value = true
  } catch (error) {
    console.error('Error fetching post details for edit:', error)
  }
}

const deletePost = async (slug: string) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        Swal.fire('Deleted!', 'Your post has been deleted.', 'success')
        fetchArticles() // Refresh the article list
      }
    })
  } catch (error) {
    console.error('Error deleting post:', error)
  }
}

const togglePostsFilter = () => {
  showMyPosts.value = !showMyPosts.value
}

const filteredArticles = computed(() => {
  return articles.value.filter((article: any) => {
    return showMyPosts.value ? article.authorId === currentUserId.value : true
  })
})

const latestPostsTitle = computed(() => `Latest Posts (${totalPostsCount.value})`)
const filterButtonWithCount = computed(() => `My Posts (${myPostsCount.value})`)

onMounted(() => {
  loadPageFromStorage()
  fetchArticles()
})
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
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

.post-actions {
  display: flex;
  align-items: center;
}
/* Style for the like icon container */
.likes {
  margin-top: 20px;
  margin-left: 10px;
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
  color: #ccc; /* Default color when not liked */
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
  right: 0; /* Align the sorting dropdown to the right */
  display: flex;
  align-items: center;
  padding-right: 150px;
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
  cursor: pointer;
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
  font-size: 24px;
  font-weight: 700;
  color: #0d0925;
  margin-bottom: 10px;
}

.article-card__text {
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

.material-symbols-outlined {
  color: #486bdb;
  padding-right: 5px;
}

/* Pagination Styling */
.pagination {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.pagination a {
  color: #3186d6;
  padding: 8px 16px;
  margin: 0 4px;
  text-decoration: none;
  border: 1px solid #3186d6;
  border-radius: 5px;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.pagination a.active {
  background-color: #3186d6;
  color: #fff;
  border: 1px solid #3186d6;
}

.pagination a:hover:not(.active) {
  background-color: #3186d6;
  color: #fff;
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
