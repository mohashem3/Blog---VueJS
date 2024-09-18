<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import Swal from 'sweetalert2'

import type { Comment } from '../types/types.ts'
import axios from 'axios'

const props = defineProps({
  slug: {
    type: String,
    required: true
  },

  comments: {
    type: Array as () => Comment[],
    default: () => []
  },
  postOwnerId: {
    type: Number,
    required: true
  },
  parentId: {
    type: Number,
    default: null
  },
  isReply: {
    type: Boolean,
    default: false
  },
  fetchPost: {
    type: Function,
    required: true
  },
  totalCommentsCount: {
    type: Number,
    required: false
  }
})

const commentContent = ref<string>('')
const isEditing = ref<boolean>(false)
const editedCommentId = ref<number | null>(null)
const userId = ref<number | null>(null)
const isRepliesVisible = ref<Record<number, boolean>>({})
const commentInputRefs = ref<Record<number, HTMLInputElement | null>>({})

const repliesHeaderText = computed(() => {
  if (props.isReply) {
    return props.comments.length ? `Replies (${props.comments.length})` : 'No Replies Yet'
  }
  return props.totalCommentsCount ? `Comments (${props.totalCommentsCount})` : 'No Comments Yet'
})

const getAuthToken = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    console.error('No auth token found')
  }
  return token
}

// const submitComment = async (parentId: number | null = null) => {
//   try {
//     const token = getAuthToken()
//     if (!token) return

//     const response = await axios.post<{ data: Comment }>(
//       `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments`,
//       { content: commentContent.value, parent_id: parentId },
//       { headers: { Authorization: `Bearer ${token}` } }
//     )

//     if (response.data.data) {
//       await nextTick() // Ensure DOM update

//       commentContent.value = ''
//       // Call fetchPost from prop
//       if (props.fetchPost) {
//         props.fetchPost()
//       }
//     } else {
//       console.error('Failed to add comment')
//     }
//   } catch (error) {
//     console.error('Error submitting comment:', error)
//   }
// }

const submitComment = async (parentId: number | null = null) => {
  try {
    const token = getAuthToken()
    if (!token) return

    const response = await axios.post<{ data: Comment }>(
      `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments`,
      { content: commentContent.value, parent_id: parentId },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (response.data.data) {
      await nextTick() // Ensure DOM update

      commentContent.value = ''
      if (props.fetchPost) {
        props.fetchPost()
      }
    } else {
      console.error('Failed to add comment')
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
  }
}

const toggleReplies = (commentId: number) => {
  isRepliesVisible.value[commentId] = !isRepliesVisible.value[commentId]
}

const startEdit = (comment: Comment, inputRef: HTMLInputElement | null) => {
  isEditing.value = true
  editedCommentId.value = comment.id ?? null
  commentContent.value = comment.content

  nextTick(() => {
    inputRef?.focus()
    inputRef?.scrollIntoView({ behavior: 'smooth' })
    inputRef?.classList.add('highlight')
  })
}

const updateComment = async () => {
  if (editedCommentId.value === null) return

  try {
    const token = getAuthToken()
    if (!token) return

    await axios.put(
      `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments/${editedCommentId.value}`,
      { content: commentContent.value },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    commentContent.value = ''
    isEditing.value = false
    editedCommentId.value = null
    // Call fetchPost from prop
    if (props.fetchPost) {
      props.fetchPost()
    }
  } catch (error) {
    console.error('Error updating comment:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedCommentId.value = null
  commentContent.value = ''
}

const deleteComment = async (commentId: number) => {
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
      const token = getAuthToken()
      if (!token) return

      await axios.delete(
        `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      // Call fetchPost from prop
      if (props.fetchPost) {
        props.fetchPost()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }
}

const canEditComment = (comment: Comment) => {
  return comment.user?.id === userId.value
}

const canDeleteComment = (comment: Comment) => {
  return comment.user?.id === userId.value
}

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    userId.value = user.id
    console.log('User ID retrieved:', userId.value) // Debugging log
  } else {
    console.error('No user data found in localStorage')
  }
})
</script>

<template>
  <div class="comment-section">
    <div class="comment-section-sidebar">
      <form @submit.prevent="submitComment(parentId)" class="comment-form">
        <div class="field">
          <input
            type="text"
            required
            v-model="commentContent"
            :class="{ highlight: isEditing }"
            ref="mainCommentInput"
            :placeholder="isReply ? 'Reply' : 'Comment'"
          />
        </div>
        <button type="submit" class="add-comment-button" v-if="!isEditing">
          {{ isReply ? 'Add Reply' : 'Add Comment' }}
        </button>
        <button v-if="isEditing" @click.prevent="updateComment" class="add-comment-button">
          Update {{ isReply ? 'Reply' : 'Comment' }}
        </button>
        <button v-if="isEditing" @click.prevent="cancelEdit" class="cancel-button">Cancel</button>
      </form>

      <h3>{{ repliesHeaderText }}</h3>
      <div v-if="comments.length" class="comments-list">
        <template v-for="comment in comments.slice().reverse()" :key="comment.id">
          <div class="comment-card">
            <div class="comment-card__header">
              <span class="material-symbols-outlined">account_circle</span>
              <span class="comment-card__author">{{ comment.user?.name }}</span>
            </div>
            <div class="comment-card__content">
              <p
                :class="{ 'highlight-text': editedCommentId === comment.id }"
                class="comment-card__text"
              >
                {{ comment.content }}
              </p>
            </div>

            <div class="comment-card__actions">
              <img
                v-if="canEditComment(comment)"
                @click="startEdit(comment, commentInputRefs[comment.id])"
                width="18"
                height="18"
                src="https://img.icons8.com/metro/26/000000/edit.png"
                alt="Edit Comment"
                class="action-icon"
              />
              <img
                v-if="canDeleteComment(comment)"
                @click="deleteComment(comment.id)"
                width="21"
                height="21"
                src="https://img.icons8.com/windows/32/000000/trash.png"
                alt="Delete Comment"
                class="action-icon"
              />
            </div>

            <!-- Toggle show/hide replies with replies count -->
            <button class="show-replies-button" @click="toggleReplies(comment.id)">
              {{
                isRepliesVisible[comment.id]
                  ? 'Hide Replies'
                  : `Show Replies (${comment.children?.length || 0})`
              }}
            </button>
          </div>
          <!-- Show replies -->
          <div v-if="isRepliesVisible[comment.id]" class="replies-section">
            <CommentSection
              :slug="slug"
              :comments="comment.children || []"
              :postOwnerId="postOwnerId"
              :parentId="comment.id"
              :isReply="true"
              :fetchPost="fetchPost"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  padding: 20px;
  background-color: #d6d6d6;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  width: 100%;
}

.comment-section-sidebar {
  position: relative;
}

.replies-section {
  border: 1px solid #ccc; /* Light gray border 5
  border-radius: 8px; /* Slightly more rounded corners */
  margin-top: 20px;
  margin-bottom: 20px; /* Space between sections */
  width: calc(100%); /* Expands the section outside the normal width */

  box-shadow: 0px 4px 12px rgba(60, 151, 207, 0.6); /* Stronger shadow effect */
  overflow: hidden; /* Prevents overflow of content */
}

.replies-section .replies-section {
  width: 100%; /* Prevent shrinking for nested replies */
  margin-left: 0; /* Remove the extra indentation */
}

.comment-form {
  margin-bottom: 20px;
}

.field {
  position: relative;
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #5267ff;
  border-radius: 20px;
  outline: none;
  box-sizing: border-box;
}

input.highlight {
  border-color: #5267ff;
}

label {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.add-comment-button {
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  border: none;
  border-radius: 25px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  margin-right: 10px;
}

.cancel-button {
  background-color: #f44336;
  border: none;
  border-radius: 25px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  margin-right: 10px;
}

.add-comment-button:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
  color: white;
}

.comments-list {
  margin-top: 20px;
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
}

.comment-card__header {
  display: flex;
  align-items: center;
}

.material-symbols-outlined {
  font-size: 30px;
  margin-right: 8px;
}

.comment-card__author {
  font-weight: bold;
}

.comment-card__content {
  margin-top: 10px;
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
</style>
