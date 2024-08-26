<template>
  <div class="container">
    <!-- Header and Buttons -->
    <div class="header-container">
      <button class="filter-posts-button my-post-button" @click="togglePostsFilter">
        <img :src="myPostIcon" alt="My Posts Icon" class="button-icon" />
        {{ filterButtonWithCount }}
      </button>
      <h2 class="header">{{ headerTitle }}</h2>
      <button class="new-post-button" @click="openAddPostPopup">
        <img :src="addIcon" alt="Add Post Icon" class="button-icon" />
        New Post
      </button>
    </div>

    <!-- Article Cards -->
    <div v-for="article in paginatedArticles" :key="article.slug" class="article-card">
      <div class="article-card__img">
        <img src="../assets/img/blogging.jpg" alt="Article Image" />
      </div>
      <div class="article-card__content">
        <h3 class="article-card__title">{{ article.title }}</h3>
        <p class="article-card__text">{{ article.content }}</p>
        <div class="user">
          <span class="material-symbols-outlined"> account_circle </span>
          <span class="article-card__author">{{ article.author }}</span>
        </div>
        <div class="post-actions">
          <img
            v-if="isPostOwner(article.authorId)"
            @click="openEditPostPopup(article.slug)"
            width="18"
            height="18"
            src="https://img.icons8.com/metro/26/000000/edit.png"
            alt="edit"
            class="edit-icon"
          />
          <img
            v-if="isPostOwner(article.authorId)"
            @click="deletePost(article.slug)"
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
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
      <a href="#" @click.prevent="prevPage">&laquo;</a>
      <a
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        href="#"
        @click.prevent="goToPage(page)"
        >{{ page }}</a
      >
      <a href="#" @click.prevent="nextPage">&raquo;</a>
    </div>

    <!-- AddPost Popup -->
    <AddPost
      :showPopup="showAddPostPopup"
      :postData="currentPost"
      :mode="mode"
      @update:showPopup="showAddPostPopup = $event"
      @post-added="fetchArticles"
    />
  </div>

  <!-- CommentSection Sidebar -->
  <CommentSection
    v-if="isCommentSectionOpen"
    :slug="activeSlug"
    :isOpen="isCommentSectionOpen"
    @close="closeCommentSection"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import AddPost from '../components/AddPost.vue'
import addIcon from '../assets/img/add-icon.svg'
import myPostIcon from '../assets/img/myposts-icon.svg'
import commentIcon from '../assets/img/comment-icon.svg'
import CommentSection from './CommentSection.vue'

const props = defineProps({
  showOnlyMyBlogs: {
    type: Boolean,
    default: false
  }
})

const articles = ref([])
const currentPost = ref(null)
const currentPage = ref(1)
const articlesPerPage = 10
const totalPages = computed(() => Math.ceil(articles.value.length / articlesPerPage))

const currentUserId = ref('')
const showAddPostPopup = ref(false)
const mode = ref<'add' | 'edit'>('add')
const showMyPosts = ref(false)

const isCommentSectionOpen = ref(false)
const activeSlug = ref(null)

const toggleCommentSection = (slug: string) => {
  activeSlug.value = slug
  isCommentSectionOpen.value = !isCommentSectionOpen.value
}

const closeCommentSection = () => {
  isCommentSectionOpen.value = false
}

const fetchArticles = async () => {
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

    const response = await axios.get('https://interns-blog.nafistech.com/api/posts', {
      headers: { Authorization: `Bearer ${token}` }
    })

    articles.value = response.data.map((article: any) => ({
      title: article.title,
      content: article.content.substring(0, 70) + '...',
      author: article.user.name,
      slug: article.slug,
      authorId: article.user.id
    }))

    if (showMyPosts.value) {
      articles.value = articles.value.filter((article) => article.authorId === currentUserId.value)
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
  }
}

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage
  const end = start + articlesPerPage
  return articles.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
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

    currentPost.value = response.data
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
      fetchArticles()
    } catch (error) {
      console.error('Error deleting post:', error)
      Swal.fire('Error!', 'Failed to delete the post. Please try again.', 'error')
    }
  }
}

const myPostsCount = computed(() => {
  return articles.value.filter((article) => article.authorId === currentUserId.value).length
})

const filterButtonWithCount = computed(() => {
  if (showMyPosts.value) {
    return 'All Posts'
  } else {
    return `My Posts (${myPostsCount.value})`
  }
})

const togglePostsFilter = () => {
  showMyPosts.value = !showMyPosts.value
  fetchArticles()
}

const headerTitle = computed(() => {
  return showMyPosts.value ? 'My Posts' : 'Latest Posts'
})

onMounted(() => {
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
