<template>
  <div class="container">
    <!-- Blog Post Details -->
    <div v-if="post" class="post-details">
      <h1>{{ post.title }}</h1>
      <img :src="post.image" alt="Post Image" class="post-image" />
      <p>{{ post.content }}</p>

      <!-- Comment Section -->
      <div class="comment-section">
        <h3>Comments</h3>
        <div v-if="comments.length">
          <div v-for="comment in displayedComments" :key="comment.id" class="comment">
            <p>
              <strong>{{ comment.user.name }}:</strong> {{ comment.content }}
            </p>
            <span class="comment-time">{{ comment.created_at_readable }}</span>
          </div>
        </div>
        <div v-else>No comments yet.</div>
        <button v-if="comments.length > 5" @click="toggleComments">
          {{ showAllComments ? 'Show Less' : 'Show More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const post = ref(null)
const comments = ref([]) // Holds all comments
const displayedComments = ref([]) // Holds comments to display
const showAllComments = ref(false)

const fetchPost = async () => {
  try {
    const slug = route.params.slug
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    post.value = response.data.data
    comments.value = post.value.comments

    // Set initially displayed comments
    displayedComments.value = comments.value.slice(0, 5) // Show first 5 comments initially
  } catch (error) {
    console.error('Error fetching post:', error)
  }
}

const toggleComments = () => {
  showAllComments.value = !showAllComments.value
  displayedComments.value = showAllComments.value ? comments.value : comments.value.slice(0, 5)
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
/* Add relevant styles here */
</style>

<style scoped>
.comment-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%; /* Adjust width to fit sidebar */
  max-width: 450px; /* Or any desired max width */
  border: 1px solid #3186d6;
}

.comment-card__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-card__header .material-symbols-outlined {
  color: #3186d6;
  font-size: 24px;
  margin-right: 8px;
}

.comment-card__author {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.comment-card__content {
  margin-bottom: 8px;
}

.comment-card__text {
  font-size: 14px;
  color: #555;
}

.comment-card__actions {
  display: flex;
  justify-content: flex-end;
}

.action-icon {
  cursor: pointer;
  margin-left: 10px;
  transition: opacity 0.3s ease;
}

.action-icon:hover {
  opacity: 0.7;
}
</style>
