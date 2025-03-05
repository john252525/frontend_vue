<template>
  <div @click="closeEmojiModal" class="cont"></div>
  <section class="modal">
    <section class="modal-content">
      <!-- <span class="close" @click="$emit('close')">&times;</span> -->
      <!-- <h2 class="title">Эмодзи по категориям</h2> -->
      <article class="list-option">
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('faces')"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            class="svg-icon"
            viewBox="0 0 24 24"
          >
            <g stroke-linecap="round" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 9.05v-.1m8 .1v-.1" />
              <path
                stroke-linejoin="round"
                d="M16 14c-.5 1.5-1.79 3-4 3s-3.5-1.5-4-3"
              />
            </g>
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('animals')"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            class="svg-icon"
            viewBox="0 0 14 14"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 5v2a1 1 0 0 0 1 1h.5a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H11a2 2 0 0 1-.91-.22A6.88 6.88 0 0 0 7 1a6.88 6.88 0 0 0-3.11.78A2.07 2.07 0 0 1 3 2H1.5a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2H3a1 1 0 0 0 1-1V5m7.5 3l-.31 1.57a4.27 4.27 0 0 1-8.38 0L2.5 8m4 2h1"
            />
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('food')"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            class="svg-icon-fill"
            viewBox="0 0 20 20"
          >
            <path
              d="M7 4.5c-.3 0-.5.3-.5.5v2.5h-1V5c0-.3-.2-.5-.5-.5s-.5.3-.5.5v2.5h-1V5c0-.3-.2-.5-.5-.5s-.5.3-.5.5v3.3c0 .9.7 1.6 1.5 1.7v7c0 .6.4 1 1 1s1-.4 1-1v-7c.8-.1 1.5-.8 1.5-1.7V5c0-.2-.2-.5-.5-.5M9 5v6h1v6c0 .6.4 1 1 1s1-.4 1-1V2c-1.7 0-3 1.3-3 3m7-1c-1.4 0-2.5 1.5-2.5 3.3c-.1 1.2.5 2.3 1.5 3V17c0 .6.4 1 1 1s1-.4 1-1v-6.7c1-.7 1.6-1.8 1.5-3C18.5 5.5 17.4 4 16 4"
            />
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('nature')"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            class="svg-icon-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 0c-.787 0-1.292.592-1.572 1.151A4.35 4.35 0 0 0 6 3v3.691l-2 1V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.191l-1.17.585A1.5 1.5 0 0 0 0 10.618V12a.5.5 0 0 0 .582.493l1.631-.272l.313.937a.5.5 0 0 0 .948 0l.405-1.214l2.21-.369l.375 2.253l-1.318 1.318A.5.5 0 0 0 5.5 16h5a.5.5 0 0 0 .354-.854l-1.318-1.318l.375-2.253l2.21.369l.405 1.214a.5.5 0 0 0 .948 0l.313-.937l1.63.272A.5.5 0 0 0 16 12v-1.382a1.5 1.5 0 0 0-.83-1.342L14 8.691V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v.191l-2-1V3c0-.568-.14-1.271-.428-1.849C9.292.591 8.787 0 8 0"
            />
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('activities')"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            class="svg-icon-fill"
            viewBox="0 0 448 512"
          >
            <path
              d="M169.41 64c2.018 14.334 9.007 36.64 14.437 50.22c5.932 14.835 12.377 28.928 23.53 40.709l33.177 24.817c14.678 11.027 28.865 22.975 41.85 35.96c2.814 2.814 11.738 13.569 15.473 13.14c4.164-.47 3.39-8.077 3.359-11.048c-.178-15.265-8.621-37.613-15.432-51.266c-8.998-18.037-19.68-35.646-33.836-50.178c-10.253-10.525-27.098-22.557-39.663-30.435C203.161 80.185 179.16 65.83 169.41 64M7.241 107.942c1.203 13.36 9.74 23.331 18.832 32.434c15.537 15.557 31.115 25.298 49.173 37.32c7.272 4.833 24.985 16.425 32.434 19.177c-7.753 2.207-11.226.094-18.832 0c-12.294-.136-23.708.753-35.573 4.185c3.63 9.49 11.687 17.085 18.833 24.053c18.382 17.922 56.298 36.754 81.607 41.86l-18.833 2.385l-32.433 5.985c3.076 7.857 12.711 17.483 18.393 24.064c25.35 29.357 50.795 46.495 90.416 46.034l26.156-2.092c4.017-.042 11.53-.618 13.026 4.3c1.014 3.316-2.731 8.788-4.562 11.393c-4.896 6.947-16.07 20.308-22.065 26.115c-24.325 23.54-63.884 45.543-98.347 47.122c3.358 4.395 11.571 5.765 16.74 7.345c13.727 4.227 34.871 8.182 49.173 8.349c18.79.22 37.08-.743 55.451-5.106c64.114-15.223 112.576-56.486 139.872-116.258c16.583-36.315 15.485-76.313 29.39-105.67c4.435-9.375 8.819-15.621 16.97-22.17c2.343-1.894 8.558-5.504 7.595-9.02c-.868-3.159-6.926-4.11-9.688-4.75c-8.433-1.935-20.705-3.807-29.295-3.818h-14.647c-25.006.293-48.515 13.246-64.03 32.434l-17.473 25.11c-2.26 2.929-5.325 6.957-9.52 6.413c-3.359-.45-7.084-4.164-9.417-6.434l-15.986-16.542c-17.284-17.733-37.592-33.375-58.297-46.903c-47.133-30.77-101.684-50.47-156.936-60.43zm372.462 94.633c13.727-1.34 14.647 15.327 4.185 17.89c-9.908 2.438-17.514-12.607-4.185-17.89"
            />
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('travel')"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            class="svg-icon-fill"
            viewBox="0 0 20 20"
          >
            <path
              d="M4.708 4a7.97 7.97 0 0 1 4.296-1.939c.062.43.14.909.24 1.408c.18.9.43 1.88.776 2.777c.276.719.623 1.409 1.062 1.965L10 9.293zM4 4.709a7.97 7.97 0 0 0-1.94 4.296c.43.062.908.14 1.407.24c.9.18 1.88.43 2.777.776c.719.276 1.41.623 1.965 1.062L9.293 10zm3.496 7.088c-.43-.32-.982-.601-1.61-.843c-.827-.318-1.747-.554-2.615-.728A25 25 0 0 0 2 10.005a7.97 7.97 0 0 0 2 5.287zM4.706 16l3.497-3.496c.32.43.6.982.842 1.61c.318.826.554 1.747.728 2.614c.09.448.162.88.22 1.273a7.97 7.97 0 0 1-5.286-2m4.21-4.21L10 10.708L15.292 16a7.97 7.97 0 0 1-4.296 1.94c-.063-.43-.142-.909-.241-1.408c-.18-.9-.43-1.88-.775-2.777c-.277-.718-.623-1.408-1.063-1.964M16 15.293a7.97 7.97 0 0 0 1.94-4.296c-.43-.062-.909-.14-1.408-.24c-.9-.18-1.88-.43-2.777-.775c-.718-.277-1.409-.623-1.965-1.063L10.707 10zm-3.497-7.087c.43.32.983.6 1.61.842c.827.318 1.748.554 2.615.728c.448.09.88.162 1.273.22a7.97 7.97 0 0 0-2-5.287zM15.292 4a7.97 7.97 0 0 0-5.287-2c.058.393.13.825.22 1.273c.174.868.41 1.788.728 2.614c.242.628.522 1.18.842 1.61z"
            />
          </svg>
        </div>
        <div class="svg-icon-cont">
          <svg
            @click="setCategory('objects')"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            class="svg-icon-fill"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.514 2 12 2m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8s8 3.589 8 8s-3.589 8-8 8"
            />
            <path d="M13 7h-2v5.414l3.293 3.293l1.414-1.414L13 11.586z" />
          </svg>
        </div>
        <!-- <div class="svg-icon-cont">
            <svg
              @click="setCategory('symbols')"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              class="svg-icon"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 3C4.239 3 2 5.216 2 7.95c0 2.207.875 7.445 9.488 12.74a.985.985 0 0 0 1.024 0C21.126 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3s-5 3-5 3s-2.239-3-5-3"
              />
            </svg>
          </div> -->
      </article>
      <div v-if="currentCategory">
        <div>
          <span
            class="emoji"
            v-for="item in emojis[currentCategory]"
            :key="item.name"
            @click="addEmoji(item.emoji)"
          >
            {{ item.emoji }}
          </span>
        </div>
      </div>
      <div v-else>
        <p>Выберите категорию, чтобы увидеть эмодзи.</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits();
const emojiModal = ref(null);
const emojis = ref({});
const currentCategory = ref("faces");
const categoryIcons = [
  { label: "Faces", category: "faces" },
  { label: "Animals", category: "animals" },
  { label: "Food", category: "food" },
  { label: "Nature", category: "nature" },
  { label: "Activities", category: "activities" },
  { label: "Travel", category: "travel" },
  { label: "Objects", category: "objects" },
  { label: "Symbols", category: "symbols" },
];

const setCategory = (category) => {
  currentCategory.value = category;
};

const addEmoji = (emoji) => {
  emit("addEmoji", emoji);
};

const closeEmojiModal = () => {
  emit("closeEmoji");
};

const handleClickOutside = (event) => {
  if (emojiModal.value && !emojiModal.value.contains(event.target)) {
    closeEmojiModal();
  }
};
document.addEventListener("click", handleClickOutside);
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  fetchEmojis();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const fetchEmojis = async () => {
  try {
    const response = await fetch("/emojis.json");
    if (!response.ok) {
      throw new Error("Сеть не отвечает");
    }
    const data = await response.json();
    emojis.value = data.emojis;
  } catch (error) {
    console.error("Ошибка при загрузке эмодзи:", error);
  }
};
</script>
<style scoped>
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  right: 20px;
  bottom: 70px;
  overflow: auto;
}

.cont {
  position: fixed;
  z-index: 0;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
}

.title {
  font-size: 18px;
}

.emoji {
  font-size: 20px;
  padding: 1px;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.list-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-icon {
  fill: none;
  stroke: rgb(83, 83, 83);
  padding: 10px;
  transition: all 0.15s;
}

.svg-icon-fill {
  fill: rgb(83, 83, 83);
  padding: 10px;
  transition: all 0.15s;
}

.svg-icon-fill:hover {
  fill: rgb(0, 0, 0);
  background-color: rgb(240, 240, 240);
  border-radius: 4px;
  transition: all 0.15s;
}

.svg-icon:hover {
  stroke: rgb(0, 0, 0);
  background-color: rgb(240, 240, 240);
  border-radius: 4px;
  transition: all 0.15s;
}

.svg-icon-cont {
  display: flex;
  align-items: center;
  justify-content: center;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
