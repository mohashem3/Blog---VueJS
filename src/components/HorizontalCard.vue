<template>
  <div class="container">
    <!-- Header and Buttons -->
    <div class="header-container">
      <h2 class="header">{{ latestPostsTitle }}</h2>
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
        @input="handleSearchChange"
      />

      <button class="new-post-button" @click="openAddPostPopup">
        <img :src="addIcon" alt="Add Post Icon" class="button-icon" />
        New Post
      </button>
    </div>

    <!-- Article Cards -->
    <div v-for="article in filteredArticles" :key="article.slug" class="article-card">
      <div class="article-card__img" @click="viewArticle(article.slug)">
        <img :src="article.image" alt="Article Image" />
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

          <img
            @click="toggleCommentSection(article.slug)"
            :src="commentIcon"
            alt="Comment Icon"
            class="comment-icon"
          />
          <span class="comments-count">{{ article.commentsCount }}</span>
        </div>

        <!-- Separator Line -->
        <hr class="separator-line" />

        <!-- Latest Comment Section -->
        <div class="latest-comment" v-if="article.lastComment">
          <p class="latest-comment__text">{{ article.lastComment }}</p>
        </div>
      </div>
      <!-- View More Button -->
      <div class="view-more">
        <button @click="viewArticle(article.slug)" class="view-more-button">View More</button>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
      <a href="#" v-if="pagination.prev" @click.prevent="fetchArticles(pagination.prev)">
        Previous
      </a>
      <a
        v-for="page in pagination.pages"
        :key="page.number"
        :class="{ active: page.isActive }"
        href="#"
        @click.prevent="fetchArticles(page.url)"
        >{{ page.label }}</a
      >
      <a href="#" v-if="pagination.next" @click.prevent="fetchArticles(pagination.next)"> Next </a>
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

const toggleCommentSection = (slug: string) => {
  activeSlug.value = slug
  isCommentSectionOpen.value = !isCommentSectionOpen.value
}

const closeCommentSection = () => {
  isCommentSectionOpen.value = false
}

const fetchArticles = async (url: string = 'https://interns-blog.nafistech.com/api/posts') => {
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

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        sort: sortOption.value === 'latest' ? 'desc' : 'asc',
        search: searchTerm.value
      }
    })

    articles.value = response.data.data.map((article: any) => ({
      title: article.title,
      content: article.content.substring(0, 70) + '...',
      author: article.user.name,
      slug: article.slug,
      authorId: article.user.id,
      commentsCount: article.comments_count,
      lastComment: article.last_comment ? article.last_comment.content : '',
      image: article.image_thumb
    }))

    myPostsCount.value = articles.value.filter(
      (article) => article.authorId === currentUserId.value
    ).length
    totalPostsCount.value = response.data.meta.total

    if (showMyPosts.value) {
      articles.value = articles.value.filter((article) => article.authorId === currentUserId.value)
    }

    pagination.value = {
      prev: response.data.links.prev,
      next: response.data.links.next,
      pages: response.data.meta.links
        .filter((link: any) => !isNaN(link.label))
        .map((link: any) => ({
          number: parseInt(link.label),
          url: link.url,
          isActive: link.active,
          label: link.label
        }))
    }

    currentPage.value = response.data.meta.current_page
  } catch (error) {
    console.error('Error fetching articles:', error)
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
    console.error('Error fetching post:', error)
    Swal.fire('Error!', 'Failed to fetch the post. Please try again.', 'error')
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
      fetchArticles(pagination.value.next)
    } catch (error) {
      console.error('Error deleting post:', error)
      Swal.fire('Error!', 'Failed to delete the post. Please try again.', 'error')
    }
  }
}

const filterButtonWithCount = computed(() => {
  return showMyPosts.value ? `All Posts` : `My Posts (${myPostsCount.value})`
})

const latestPostsTitle = computed(() => {
  return `Latest Posts (${totalPostsCount.value})`
})

const filteredArticles = computed(() => {
  if (!searchTerm.value) return articles.value
  return articles.value.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const handleSearchChange = () => {
  fetchArticles()
}

const togglePostsFilter = () => {
  showMyPosts.value = !showMyPosts.value
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
})

watch(searchTerm, () => {
  fetchArticles()
})
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
  margin-bottom: 30px;
  position: relative;
}

.header {
  font-size: 32px;
  font-weight: bold;
  color: #3186d6;
  margin: 0;
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

.comments-section {
  display: flex;
  align-items: center;
}

.comments-count {
  margin-left: 5px;
  font-size: 14px;
  color: #555;
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
  height: 200px;
  margin: 30px auto;
  background: #fff;
  box-shadow: 0px 14px 80px rgba(119, 125, 231, 0.277);
  border-radius: 25px;
  overflow: hidden;
  padding: 20px;
  border: 0px solid #3186d6; /* Blue border */
}

.article-card__img {
  width: 25%;
  height: 150px;
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
  cursor: pointer; /* Change cursor to pointer */
  transition: transform 0.3s ease; /* Smooth transition for hover effect */
  margin-top: 10px;
  margin-right: 20px;
  width: 20px;
  height: 20px;
}

.comment-icon:hover {
  transform: scale(1.3); /* Slightly enlarge on hover */
}

.button-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
  fill: #fff;
}
</style>
