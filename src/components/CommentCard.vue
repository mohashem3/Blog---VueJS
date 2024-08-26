<template>
  <div class="comment-card">
    <div class="comment-card__header">
      <span class="material-symbols-outlined">account_circle</span>
      <span class="comment-card__author">Author</span>
    </div>
    <div class="comment-card__content">
      <p class="comment-card__text">Comment Test</p>
    </div>
    <div class="comment-card__actions">
      <img
        @click="editComment"
        width="18"
        height="18"
        src="https://img.icons8.com/metro/26/000000/edit.png"
        alt="Edit Comment"
        class="action-icon"
      />
      <img
        @click="deleteComment"
        width="21"
        height="21"
        src="https://img.icons8.com/windows/32/000000/trash.png"
        alt="Delete Comment"
        class="action-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  author: String,
  comment: String
})
</script>

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
