<template>
  <section v-if="!chatInfo" class="no-message-section">
    <h2 class="change-message">Выберите чат для начала общения</h2>
  </section>
  <section v-else class="app-section">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <section class="chat-section">
      <section class="message-section">
        <header class="user-info-section">
          <div @click="changeMessageListStation" class="phone-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#bcbcbc"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m14 6l-6 6l6 6"
              />
            </svg>
            <span class="out-text">Назад</span>
          </div>
          <img
            v-if="chatInfo.avatar"
            class="user-img"
            :src="chatInfo.avatar"
            @click="changeImageStation(chatInfo, true)"
            alt=""
          />

          <svg
            viewBox="0 0 152 152"
            @click="changeImageStation(chatInfo, true)"
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            class="user-chat-icon-svg"
            v-else
          >
            <g id="Layer_2" data-name="Layer 2">
              <g id="_18.Avatar" data-name="18.Avatar">
                <path
                  id="icon"
                  d="m76 0a76 76 0 0 0 0 152h2a76 76 0 0 0 -2-152zm-15.89 37.35a20.94 20.94 0 0 1 15.32-6.35 5.43 5.43 0 0 1 .57 0 20.76 20.76 0 0 1 14.76 6.33 21 21 0 0 1 6.35 15.32 20.91 20.91 0 0 1 -6.35 15.35 20.76 20.76 0 0 1 -14.76 6.33 5.43 5.43 0 0 1 -.57 0 21.68 21.68 0 0 1 -21.67-21.66 21 21 0 0 1 6.35-15.32zm49 79.48c-2.92 2.78-6.76 4.17-11.44 4.17h-43.34c-4.68 0-8.52-1.39-11.44-4.17s-4.44-6.6-4.44-11.3c0-1.82.06-3.6.18-5.32a53.31 53.31 0 0 1 .74-5.69 43.4 43.4 0 0 1 1.39-5.71 28.71 28.71 0 0 1 2.35-5.34 20.32 20.32 0 0 1 3.54-4.63 15.66 15.66 0 0 1 5.11-3.19 17.27 17.27 0 0 1 6.49-1.17c.92 0 1.8.36 3.53 1.48 1.06.7 2.29 1.51 3.67 2.37a20.23 20.23 0 0 0 4.73 2.09 18.43 18.43 0 0 0 11.62 0 20.9 20.9 0 0 0 4.75-2.09c1.38-.88 2.63-1.67 3.67-2.37 1.73-1.12 2.61-1.48 3.53-1.48a17.27 17.27 0 0 1 6.49 1.17 15.66 15.66 0 0 1 5.11 3.19 20.32 20.32 0 0 1 3.54 4.63 28.71 28.71 0 0 1 2.35 5.34 43.4 43.4 0 0 1 1.39 5.71 53.31 53.31 0 0 1 .74 5.69c.11 1.7.18 3.5.18 5.32 0 4.7-1.55 8.47-4.44 11.3z"
                />
              </g>
            </g>
          </svg>
          <div>
            <h2 class="name-user">{{ chatInfo.name }}</h2>
          </div>
        </header>
        <div ref="scrollContainer" v-if="!loading" class="messages">
          <template
            v-for="(message, index) in messages"
            :key="message.timestamp"
          >
            <!-- Плашка с датой -->
            <div v-if="shouldShowDateSeparator(index)" class="date-separator">
              {{ formatDateSeparator(message.data.time) }}
            </div>

            <div
              :class="[
                'message',
                message.data.outgoing ? 'outgoing' : 'incoming',
                {
                  'has-content':
                    message.data.content && message.data.content.length > 0,
                },
              ]"
              @mousedown="handleMouseDown($event, message)"
            >
              <div
                v-if="message.data.outgoing"
                class="dropdown-message-message"
              ></div>
              <svg
                v-if="message.data.outgoing"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 1024 1024"
                class="dropdown-message"
              >
                <path
                  fill="currentColor"
                  d="M104.704 338.752a64 64 0 0 1 90.496 0l316.8 316.8l316.8-316.8a64 64 0 0 1 90.496 90.496L557.248 791.296a64 64 0 0 1-90.496 0L104.704 429.248a64 64 0 0 1 0-90.496"
                />
              </svg>
              <div
                v-if="!message.data.outgoing"
                class="dropdown-message-message-incoming"
              ></div>
              <svg
                v-if="!message.data.outgoing"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 1024 1024"
                class="dropdown-message-incoming"
              >
                <path
                  fill="currentColor"
                  d="M104.704 338.752a64 64 0 0 1 90.496 0l316.8 316.8l316.8-316.8a64 64 0 0 1 90.496 90.496L557.248 791.296a64 64 0 0 1-90.496 0L104.704 429.248a64 64 0 0 1 0-90.496"
                />
              </svg>
              <div v-if="message.data.replyTo != null" class="reply-content">
                <h2 class="reply-name">
                  {{ formatPhoneNumber(message.data.replyTo.name) }}
                </h2>
                <h2 class="reply-text">
                  {{ truncateString(message.data.replyTo.text) }}
                </h2>
              </div>
              <div class="send-reaction-icon-cont">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 1024 1024"
                  class="send-reaction-icon"
                >
                  <path
                    d="M288 421a48 48 0 1 0 96 0a48 48 0 1 0-96 0m352 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m263 711c-34.2 34.2-74 61-118.3 79.8C611 874.2 562.3 884 512 884c-50.3 0-99-9.8-144.8-29.2A370.4 370.4 0 0 1 248.9 775c-34.2-34.2-61-74-79.8-118.3C149.8 611 140 562.3 140 512s9.8-99 29.2-144.8A370.4 370.4 0 0 1 249 248.9c34.2-34.2 74-61 118.3-79.8C413 149.8 461.7 140 512 140c50.3 0 99 9.8 144.8 29.2A370.4 370.4 0 0 1 775.1 249c34.2 34.2 61 74 79.8 118.3C874.2 413 884 461.7 884 512s-9.8 99-29.2 144.8A368.89 368.89 0 0 1 775 775M664 533h-48.1c-4.2 0-7.8 3.2-8.1 7.4C604 589.9 562.5 629 512 629s-92.1-39.1-95.8-88.6c-.3-4.2-3.9-7.4-8.1-7.4H360a8 8 0 0 0-8 8.4c4.4 84.3 74.5 151.6 160 151.6s155.6-67.3 160-151.6a8 8 0 0 0-8-8.4"
                  />
                </svg>
              </div>

              <!-- Основной контент сообщения -->
              <div class="message-content-wrapper">
                <!-- Медиа-контент (фото, видео и т.д.) -->
                <div
                  class="media-content"
                  v-if="message.data.content && message.data.content.length > 0"
                >
                  <img
                    v-if="message.data.content[0].type === 'sticker'"
                    :src="message.data.content[0].src"
                    alt="Sticker"
                    class="sticker"
                  />
                  <img
                    v-if="message.data.content[0].type === 'image'"
                    :src="message.data.content[0].src"
                    alt="Image"
                    class="img-message"
                    @click="openPhotoMenu(message.data.content[0].src)"
                  />
                  <PhotoMenu
                    :changeMenuPhotoStation="changeMenuPhotoStation"
                    :img="selectedImage"
                    v-if="station.photoMenu"
                  />
                  <video
                    v-if="message.data.content[0].type === 'video'"
                    controls
                    :src="message.data.content[0].src"
                    class="video-message"
                    @click="openVideoMenu(message.data.content[0].src)"
                  >
                    Ваш браузер не поддерживает видео.
                  </video>
                  <audio
                    v-if="message.data.content[0].type === 'audio'"
                    controls
                    :src="message.data.content[0].src"
                    class="audio-message"
                  >
                    Ваш браузер не поддерживает аудио.
                  </audio>
                  <div
                    class="content-file"
                    v-if="message.data.content[0].type === 'file'"
                    @click="downloadFile(message.data.content[0].src)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100"
                      height="100"
                      viewBox="0 0 1024 1024"
                      class="svg-icon"
                    >
                      <path
                        d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4zM790.2 326L602 137.8V326zM633.22 637.26c-15.18-.5-31.32.67-49.65 2.96c-24.3-14.99-40.66-35.58-52.28-65.83l1.07-4.38l1.24-5.18c4.3-18.13 6.61-31.36 7.3-44.7c.52-10.07-.04-19.36-1.83-27.97c-3.3-18.59-16.45-29.46-33.02-30.13c-15.45-.63-29.65 8-33.28 21.37c-5.91 21.62-2.45 50.07 10.08 98.59c-15.96 38.05-37.05 82.66-51.2 107.54c-18.89 9.74-33.6 18.6-45.96 28.42c-16.3 12.97-26.48 26.3-29.28 40.3c-1.36 6.49.69 14.97 5.36 21.92c5.3 7.88 13.28 13 22.85 13.74c24.15 1.87 53.83-23.03 86.6-79.26c3.29-1.1 6.77-2.26 11.02-3.7l11.9-4.02c7.53-2.54 12.99-4.36 18.39-6.11c23.4-7.62 41.1-12.43 57.2-15.17c27.98 14.98 60.32 24.8 82.1 24.8c17.98 0 30.13-9.32 34.52-23.99c3.85-12.88.8-27.82-7.48-36.08c-8.56-8.41-24.3-12.43-45.65-13.12M385.23 765.68v-.36l.13-.34a54.86 54.86 0 0 1 5.6-10.76c4.28-6.58 10.17-13.5 17.47-20.87c3.92-3.95 8-7.8 12.79-12.12c1.07-.96 7.91-7.05 9.19-8.25l11.17-10.4l-8.12 12.93c-12.32 19.64-23.46 33.78-33 43c-3.51 3.4-6.6 5.9-9.1 7.51a16.43 16.43 0 0 1-2.61 1.42c-.41.17-.77.27-1.13.3a2.2 2.2 0 0 1-1.12-.15a2.07 2.07 0 0 1-1.27-1.91M511.17 547.4l-2.26 4l-1.4-4.38c-3.1-9.83-5.38-24.64-6.01-38c-.72-15.2.49-24.32 5.29-24.32c6.74 0 9.83 10.8 10.07 27.05c.22 14.28-2.03 29.14-5.7 35.65zm-5.81 58.46l1.53-4.05l2.09 3.8c11.69 21.24 26.86 38.96 43.54 51.31l3.6 2.66l-4.39.9c-16.33 3.38-31.54 8.46-52.34 16.85c2.17-.88-21.62 8.86-27.64 11.17l-5.25 2.01l2.8-4.88c12.35-21.5 23.76-47.32 36.05-79.77zm157.62 76.26c-7.86 3.1-24.78.33-54.57-12.39l-7.56-3.22l8.2-.6c23.3-1.73 39.8-.45 49.42 3.07c4.1 1.5 6.83 3.39 8.04 5.55a4.64 4.64 0 0 1-1.36 6.31a6.7 6.7 0 0 1-2.17 1.28"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Текст сообщения -->
                <div class="text-content" v-if="message.data.text">
                  {{ message.data.text }}
                </div>

                <!-- Футер с временем и статусом -->
                <footer class="message-footer">
                  <h2 class="reaction">{{ message.reaction }}</h2>
                  <div class="message-time">
                    {{ formatTimestamp(message.data.time) }}
                  </div>
                  <svg
                    v-if="
                      message.data.state === 'delivered' &&
                      message.data.outgoing
                    "
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <g fill="#B5B8B1">
                      <path
                        d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293L1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7l-.896-.897l.707-.707l.543.543l6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"
                      />
                      <path
                        d="m5.354 7.146l.896.897l-.707.707l-.897-.896a.5.5 0 1 1 .708-.708"
                      />
                    </g>
                  </svg>
                  <svg
                    v-if="
                      message.data.state === 'has_seen' && message.data.outgoing
                    "
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <g fill="#42AAFF">
                      <path
                        d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293L1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7l-.896-.897l.707-.707l.543.543l6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"
                      />
                      <path
                        d="m5.354 7.146l.896.897l-.707.707l-.897-.896a.5.5 0 1 1 .708-.708"
                      />
                    </g>
                  </svg>
                  <svg
                    class="state-img"
                    v-if="
                      message.data.state === 'sendMessage' &&
                      message.data.outgoing
                    "
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="#B5B8B1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m4 12l6 6L20 6"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    class="state-img"
                    v-if="
                      message.data.state === 'error' && message.data.outgoing
                    "
                  >
                    <path
                      fill="currentColor"
                      d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
                    />
                  </svg>
                </footer>
              </div>
            </div>
          </template>
        </div>
        <Loading v-if="loading" />
        <section class="error-section" v-if="!loading && station.messageNull">
          <article class="cont">
            <h2>Собщения не были загружены или вовсе отсутсвуют.</h2>
            <h2>Самое время начать ощаться!</h2>
          </article>
        </section>
        <SendMessage
          v-if="!loading"
          :changeMessageState="changeMessageState"
          :chatInfo="chatInfo"
          @updateMessages="updateMessages"
          :replyToData="replyToData"
          :replyToDataBolean="replyToDataBolean"
          :offReplyToDataBolean="offReplyToDataBolean"
          :offReplyToDataBoleanFalse="offReplyToDataBoleanFalse"
          :clearDataToReply="clearDataToReply"
        />
        <div
          v-if="showScrollButton"
          class="scroll-to-bottom"
          @click="scrollToBottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42Z"
            />
          </svg>
        </div>
      </section>
    </section>
    <ActionModal
      v-if="activeMessage"
      :message="activeMessage"
      :modalPosition="modalPosition"
      @close="activeMessage = null"
      :addDataToReply="addDataToReply"
      :updateDeleteMessage="updateDeleteMessage"
      :chatInfo="chatInfo"
    />
  </section>
</template>
<!-- slice().reverse() -->
<script setup>
import { ref, onMounted, computed, watch, toRefs, reactive } from "vue";
import axios from "axios";
import SendMessage from "./SendMessage.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Loading from "./Loading.vue";
import LoadingMessage from "./Loading/LoadingMessage.vue";
import Error from "../UserList/Error.vue";
import PhotoMenu from "./MenuContent/PhotoMenu.vue";
import NewMessageForUser from "../UserList/newMessageForUser.vue";
import ActionModal from "./ActionModal/ActionModal.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const loading = ref(false);
const props = defineProps({
  chatInfo: {
    type: Object,
  },
  changeMessageListStation: {
    type: Function,
  },
  changeImageStation: {
    type: Function,
  },
  blockChat: {
    type: Function,
  },
  blockChatOff: {
    type: Function,
  },
  changeWebhookEventData: {
    type: Function,
  },
});
const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;
const replyToData = ref([]);
const replyToDataBolean = ref(false);
const loadingMessageIndex = ref(-1);
const apiUrl = import.meta.env.VITE_API_URL;
const lastSentMessageIndex = ref(-1);
const messages = ref([]);
const messagesData = ref([]);

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};

const showScrollButton = ref(false);

const station = reactive({
  photoMenu: false,
  videoMenu: false,
  acionMenu: false,
  errorStation: false,
  messageNull: false,
});
const activeMessage = ref(null);

const testMsg = {
  to: "79198670001",
  from: "79228556998",
  item: "3A24BA98AB791BCAAE9F",
  text: "А кто ты такой?",
  time: 1739979536000000,
  state: true,
  source: "whatsapp",
  thread: "79198670001@c.us",
  content: [],
  replyTo: null,
  outgoing: true,
  reaction: "",
  send: true,
};

const addDataToReply = (data) => {
  replyToData.value = data;
  replyToDataBolean.value = true;
  console.log(replyToData.value);
};

const clearDataToReply = () => {
  replyToData.value = [];
  console.log("данныз нет");
};

const offReplyToDataBolean = () => {
  replyToDataBolean.value = !replyToDataBolean.value;
};

const shouldOpenModal = (message) => {
  if (message.data.content && message.data.content.length > 0) {
    const contentType = message.data.content[0].type;
    return !(contentType === "image" || contentType === "video");
  }
  return true; // Открывать модальное окно, если нет контента
};

const offReplyToDataBoleanFalse = () => {
  replyToDataBolean.value = false;
  clearDataToReply();
};

const changeMessageState = (newMessage, tempId) => {
  console.log("вгеме77ше 1в", tempId);
  console.log(newMessage);

  const newMessages = {
    uniq: newMessage.item,
    timestamp: newMessage.time,
    data: {
      content: newMessage.content,
      item: newMessage.item,
      outgoing: true,
      replyTo: newMessage.replyTo,
      text: newMessage.text,
      time: newMessage.time,
      state: newMessage.state,
    },
    reaction: null,
    state: 0,
  };

  const trackAndRemoveAndAddMessage = (tempId) => {
    // Ищем индекс сообщения по tempId
    console.log(messages.value);
    const messageIndex = messages.value.findIndex(
      (message) => message.tempId === tempId
    );

    if (messageIndex !== -1) {
      // Удаляем сообщение из массива
      const removedMessage = messages.value.splice(messageIndex, 1)[0];
      console.log("Сообщение удалено:", removedMessage);
    } else {
      console.log("Сообщение с таким tempId не найдено:", tempId);
    }

    if (newMessage.replyTo !== null) {
      console.log("newMessage.replyTo !== null", newMessage.replyTo);

      // Найти первое сообщение, которое соответствует replyTo
      const replyToMessage = messages.value.find(
        (message) =>
          message.data.item !== null && message.data.item === newMessage.replyTo
      );

      if (replyToMessage) {
        console.log(replyToMessage.data.from, replyToMessage.data.text);
        newMessages.data.replyTo = {
          name: replyToMessage.data.from,
          text: replyToMessage.data.text,
          value: true,
        };
      }
    }

    console.log("новое сообщение newMess", newMessages);
    messages.value.push(newMessages);
    console.log("Добавлено новое сообщение:", newMessages);
  };

  setTimeout(() => {
    scrollToBottom();
  }, 500);

  // Вызов функции для отслеживания, удаления и добавления
  trackAndRemoveAndAddMessage(tempId);
  console.log(messages.value); // Исправлено на .value
};

const handleMouseDown = (event, message) => {
  // event.button показывает, какая кнопка мыши была нажата:
  // 0: Левая кнопка
  // 1: Колесико мыши
  // 2: Правая кнопка

  // Вызываем openModal, если нужно открывать модальное окно
  if (shouldOpenModal(message)) {
    openModal(event, message);
  }
};

const updateMessages = (newMessage) => {
  console.log("newMessage in updateMessages", newMessage); //  Для отладки
  console.log("chatInfo in updateMessages", props.chatInfo);
  console.log("updateMessages updateMessages updateMessages");
  if (station.messageNull) {
    station.messageNull = false;
  }
  if (newMessage.replyTo) {
    if (newMessage.replyTo !== null) {
      // console.log("newMessage.replyTo !== null", newMessage.data.replyTo);

      const replyToMessage = messages.value.find(
        (message) =>
          message.data.item !== null &&
          message.data.item === newMessage.data.replyTo
      );

      if (replyToMessage) {
        console.log(replyToMessage.data.from, replyToMessage.data.text);
        newMessage.data.replyTo = {
          name: replyToMessage.data.from,
          text: replyToMessage.data.text,
          value: true,
        };
      }
    }
  }

  messages.value.push(newMessage); // Добавление нового сообщения
  console.log("Новое сообщение", newMessage);
  console.log("messages.value", messages.value);

  setTimeout(() => {
    scrollToBottom(); // Прокрутка вниз
  }, 500);
};

const modalPosition = ref({ top: 0, left: 0 });

const openModal = (event, item) => {
  console.log(item);
  if (activeMessage.value !== item) {
    activeMessage.value = item;
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Проверяем, является ли контент изображением или видео
    if (item.data.content && item.data.content.length > 0) {
      const contentType = item.data.content[0].type;
      if (contentType === "image" || contentType === "video") {
        return; // Прерываем выполнение функции
      }
    }

    // Определяем базовые параметры
    const modalWidth = 200; // Ширина модального окна
    const modalHeight = 120; // Высота модального окна
    const margin = 10; // Отступ от сообщения

    // Определяем, в верхней или нижней части экрана находится сообщение
    const isInTopHalf = rect.top < viewportHeight / 2;

    // Для входящих сообщений (не исходящих)
    if (!item.data.outgoing) {
      if (isInTopHalf) {
        // Если сообщение в верхней части - открываем ниже
        modalPosition.value = {
          top: rect.bottom + window.scrollY + margin,
          left: rect.left + window.scrollX,
          transform: "none",
        };
      } else {
        // Если сообщение в нижней части - открываем выше
        modalPosition.value = {
          top: rect.top + window.scrollY - modalHeight - margin,
          left: rect.left + window.scrollX,
          transform: "none",
        };
      }
    }
    // Для исходящих сообщений
    else {
      if (isInTopHalf) {
        // Если сообщение в верхней части - открываем ниже и слева
        modalPosition.value = {
          top: rect.bottom + window.scrollY + margin,
          left: rect.right + window.scrollX - modalWidth,
          transform: "none",
        };
      } else {
        // Если сообщение в нижней части - открываем выше и слева
        modalPosition.value = {
          top: rect.top + window.scrollY - modalHeight - margin,
          left: rect.right + window.scrollX - modalWidth,
          transform: "none",
        };
      }
    }

    // Корректировка, если модальное окно выходит за границы экрана
    const modalRightEdge = modalPosition.value.left + modalWidth;
    const windowWidth = window.innerWidth;

    if (modalRightEdge > windowWidth) {
      modalPosition.value.left = windowWidth - modalWidth - margin;
    }

    if (modalPosition.value.left < 0) {
      modalPosition.value.left = margin;
    }
  }
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const scrollContainer = ref(null);

const setupScrollObserver = () => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("scroll", () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      showScrollButton.value = !isNearBottom;

      // Добавьте/уберите класс для анимации
      const button = document.querySelector(".scroll-to-bottom");
      if (button) {
        if (showScrollButton.value) {
          button.classList.add("visible");
        } else {
          button.classList.remove("visible");
        }
      }
    });
  }
};

const scrollToBottom = (behavior = "smooth") => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: behavior,
    });
    showScrollButton.value = false;
  }
};

watch(
  messages,
  () => {
    const container = scrollContainer.value;
    if (container) {
      const isNearBottom =
        container.scrollTop + container.clientHeight >
        container.scrollHeight - 150;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  },
  { deep: true }
);

// Функция для обновления состояния сообщения

const { chatInfo } = toRefs(props);

const pageTitle = computed(() => {
  return chatInfo.value && chatInfo.value.name ? chatInfo.value.name : "Чат";
});

// Устанавливаем заголовок страницы
watch(pageTitle, (newTitle) => {
  document.title = newTitle;
});

const messagesBolean = ref(false);

const getMessage = async () => {
  props.blockChat();
  try {
    const token = localStorage.getItem("accountToken");

    const userLogin = JSON.parse(localStorage.getItem("userInfo"));
    let requestData = {
      source: chatInfo.value.sourceUser,
      login: userLogin.login,
      to: chatInfo.value.phone,
    };

    if (apiUrl === apiCheckUrl) {
      requestData.to = chatInfo.value.phone;
      requestData.login = chatInfo.value.loginUser;
      requestData.uniq = chatInfo.value.lastMessage.id.remote;
    }

    if (chatInfo.value.sourceUser != "whatsapp") {
      requestData.source = "telegram";
    }

    const response = await axios.post(
      // `http://localhost:4000/api/getChatMessages`,
      `${apiUrl}/getChatMessages`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log("requestData", requestData);
    if (response.data) {
      await handleSendLog(
        "chats",
        "getChatMessages",
        requestData,
        response.data.ok,
        response.data
      );
    }

    messagesBolean.value = true;
    if (response.data.ok === true) {
      loading.value = false;
      props.blockChat();

      if (apiUrl === apiCheckUrl) {
        messages.value = response.data.data.messages;
        console.log(messages.value);
      } else {
        messages.value = response.data.data.messages.map((message) => ({
          data: message,
          uniq: message.item,
        }));
      }

      // Обработка replyTo
      messages.value.forEach((message) => {
        if (message.data.replyTo !== null) {
          const replyToMessage = messages.value.find(
            (msg) => msg.data.item === message.data.replyTo
          );

          if (replyToMessage) {
            message.data.replyTo = {
              name: replyToMessage.data.from,
              text: replyToMessage.data.text,
            };
          }
        }
      });

      // Обновляем messagesData
      messagesData.value = messages.value.map((message) => message.data);

      console.log(messages);
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } else if (response.status === 401 || response.data.errorMessage === 401) {
      console.log("Ошибка авторизации");
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
      console.log("Response ok:", response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    setLoadingStatus(true, "error");
    loading.value = false;
    messages.value = [];
    props.blockChatOff();
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
      setLoadingStatus(true, "error");
      loading.value = false;
      messages.value = [];
      props.blockChatOff();
    }
  }
};

const downloadFile = (url) => {
  const link = document.createElement("a"); // Создаем временный элемент <a>
  link.href = url; // Устанавливаем URL
  link.download = ""; // Устанавливаем атрибут download для инициирования скачивания
  document.body.appendChild(link); // Добавляем элемент в DOM
  link.click(); // Имитируем клик по элементу
  document.body.removeChild(link); // Удаляем элемент из DOM
};

const formatTimestamp = (timestamp) => {
  let seconds;

  // Проверяем, в каком формате передан timestamp
  if (timestamp > 1_000_000_000) {
    // Если больше 1 миллиарда, значит это микросекунды
    seconds = timestamp / 1_000_000; // Переводим в секунды
  } else {
    seconds = timestamp; // Значит это уже в секундах
  }

  const date = new Date(seconds * 1000); // Умножаем на 1000 для перевода в миллисекунды
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const changeLoading = () => {
  loading.value = !loading.value;
};

const changeMenuPhotoStation = () => {
  station.photoMenu = !station.photoMenu;
};
let previousChatInfo = null;

const formatDateSeparator = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp / 1000); // Убедитесь, что timestamp правильно конвертируется

  // Проверяем, сегодня ли было сообщение
  if (isSameDay(now, messageDate)) {
    return "Сегодня";
  }

  // Проверяем, было ли сообщение вчера
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(yesterday, messageDate)) {
    return "Вчера";
  }

  // Для более старых сообщений возвращаем дату в формате "5 апреля"
  const options = { day: "numeric", month: "long" };
  return messageDate.toLocaleDateString("ru-RU", options);
};

// Вспомогательная функция для проверки, один ли это день
const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Функция для определения, нужно ли показывать плашку даты
const shouldShowDateSeparator = (index) => {
  if (index === 0) return true; // Всегда показываем для первого сообщения

  const currentMessage = messages.value[index];
  const previousMessage = messages.value[index - 1];

  if (!currentMessage || !previousMessage) return false;

  const currentDate = new Date(currentMessage.data.time / 1000);
  const previousDate = new Date(previousMessage.data.time / 1000);

  return !isSameDay(currentDate, previousDate);
};

watch(
  () => chatInfo.value,
  (newChatInfo) => {
    if (!loading.value) {
      console.log("вывы");
      // Проверка состояния загрузки
      loading.value = true;
      getMessage();
    }
  }
);

// watch(
//   () => messages.value,
//   (newMessages) => {
//     if (station.messageNull) {
//       station.messageNull = false;
//     }
//   }
// );

const selectedImage = ref(null);

const openPhotoMenu = (src) => {
  selectedImage.value = src;
  station.photoMenu = true;
};

const updateMessageState = (item) => {
  const messageToUpdate = messages.data.data.find(
    (message) => message.item === item
  );
  console.log(messages.data.data.value);
  if (messageToUpdate) {
    messageToUpdate.state = true;
  } else {
    console.log("Сообщение с таким thread не найдено");
  }
};

const updateReactionState = (item, reaction) => {
  console.log(item);

  const messageToUpdate = messages.value.find(
    (message) => message.uniq === item
  );

  // Проверяем, найдено ли сообщение
  if (messageToUpdate) {
    messageToUpdate.reaction = reaction;
    console.log("Обновленное сообщение:", messageToUpdate);
  } else {
    console.log("Сообщение с таким uniq не найдено");
  }
};

const updateDeleteMessage = (item) => {
  console.log(item);

  const messageToUpdate = messages.value.find(
    (message) => message.uniq === item
  );

  // Проверяем, найдено ли сообщение
  if (messageToUpdate) {
    messageToUpdate.data.text = "Сообщение удалено";

    messageToUpdate.delete = true;
    console.log("Обновленное сообщение:", messageToUpdate);
  } else {
    console.log("Сообщение с таким uniq не найдено");
  }
};

function formatPhoneNumber(phoneNumber) {
  // Проверяем, что phoneNumber является строкой
  if (typeof phoneNumber !== "string") {
    console.warn("Предупреждение: phoneNumber должен быть строкой.", {
      originalInput: phoneNumber,
    });
    return "Некорректный формат номера"; // Или можно вернуть null
  }

  const cleaned = phoneNumber.replace(/\D/g, "");

  // Проверяем, что номер состоит из 11 цифр (для России)
  if (cleaned.length !== 11) {
    console.warn(
      "Предупреждение: Неверный формат номера. Должно быть 11 цифр.",
      {
        originalInput: phoneNumber,
        cleanedInput: cleaned,
      }
    );
    return "Некорректный формат номера"; // Или можно вернуть null
  }

  // Форматируем номер
  const countryCode = cleaned[0]; // Код страны (7 для России)
  const areaCode = cleaned.slice(1, 4); // Код региона (902)
  const firstPart = cleaned.slice(4, 7); // Первая часть номера (894)
  const secondPart = cleaned.slice(7, 9); // Вторая часть номера (13)
  const thirdPart = cleaned.slice(9, 11); // Третья часть номера (42)

  // Собираем номер в нужном формате
  return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}-${thirdPart}`;
}

function truncateString(str, maxLength) {
  // Проверяем, что str является строкой
  if (typeof str !== "string") {
    console.warn("Предупреждение: str должен быть строкой.", {
      originalInput: str,
    });
    return "Загрузка"; // Или можно вернуть пустую строку
  }

  // Ограничиваем длину строки
  if (str.length <= 15) {
    return str;
  }

  return str.slice(0, 15 - 3) + "...";
}

onMounted(() => {
  // Настройка наблюдателя за скроллом
  setupScrollObserver();

  // Автоматическая прокрутка вниз при загрузке
  setTimeout(() => scrollToBottom("auto"), 300);

  // Ваш существующий код EventSource
  const connectEventSource = () => {
    const eventSource = new EventSource(`${apiUrl}/events`);

    const receivedMessageIds =
      JSON.parse(localStorage.getItem("receivedMessageIds")) || [];

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      console.log("Event received:", eventData);

      // Обработка нового сообщения
      if (eventData.hook_type === "message") {
        if (!eventData.outgoing && eventData.content) {
          console.log("New incoming message with content");
          updateMessages(newMessage);
        }

        if (
          !eventData.outgoing &&
          !receivedMessageIds.includes(eventData.item)
        ) {
          const newMessage = {
            uniq: eventData.item,
            timestamp: eventData.time,
            data: eventData,
            reaction: null,
            state: 0,
          };

          receivedMessageIds.push(eventData.item);
          localStorage.setItem(
            "receivedMessageIds",
            JSON.stringify(receivedMessageIds)
          );

          if (chatInfo.value) {
            const isCurrentChat =
              eventData.thread === chatInfo.value.lastMessage.id.remote;
            if (isCurrentChat) {
              updateMessages(newMessage);
            }
          }
        }
      }

      // Обработка статуса сообщения
      if (eventData.content && eventData.hook_type === "message_status") {
        const messageToUpdate = messages.value.find(
          (message) => message.data.item === eventData.item
        );

        if (messageToUpdate) {
          if (eventData.content[0].type === "delivered") {
            messageToUpdate.data.state = "delivered";
          } else if (eventData.content[0].type === "has_seen") {
            messageToUpdate.data.state = "has_seen";
          }
        }
      }

      // Обработка реакций
      if (eventData.content && eventData.hook_type === "add_message_reaction") {
        setTimeout(() => {
          updateReactionState(eventData.replyTo, eventData.content[0].src);
        }, 1000);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Ошибка соединения:", error);
      eventSource.close();
      setTimeout(() => {
        console.log("Попытка переподключения...");
        connectEventSource();
      }, 3000);
    };

    eventSource.onopen = () => {
      console.log("Соединение с EventSource установлено");
    };
  };

  // Инициализация подключения
  connectEventSource();
});
</script>

<style scoped>
.messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  margin-top: 60px;
}

.messages::-webkit-scrollbar {
  width: 10px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: rgb(209, 209, 209);
  border-radius: 5px;
}

.reaction {
  font-size: 12px;
}

.last-sent-message {
  background-color: #e1ffc7; /* Цвет фона для последнего отправленного сообщения */
}

.send-reaction-icon-cont {
  position: absolute;
  right: 80px;
  top: 20px;
  background-color: rgb(216, 216, 216);
  display: none;
  width: 24px;
  height: 24px;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
}

.send-reaction-icon {
  fill: white;
}

.message:hover .dropdown-message {
  display: block;
  transition: all 0.25s;
}

.message:hover .dropdown-message-message {
  display: flex;
  transition: all 0.25s;
}

.message:hover .dropdown-message-incoming {
  display: block;
  transition: all 0.25s;
}

.message:hover .dropdown-message-message-incoming {
  display: flex;
  transition: all 0.25s;
}

.dropdown-message-incoming {
  display: none;
  position: absolute;
  right: 6px;
  top: 8px;
  transition: all 0.25s;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 120px; /* Увеличьте отступ снизу */
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: #06cf9c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000; /* Увеличьте z-index */
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.scroll-to-bottom.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Добавьте в .message-section */
.message-section {
  position: static; /* Уберите relative */
}

.dropdown-message-message-incoming {
  position: absolute;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background-color: #f1f1f1;
  display: none;
  align-items: center;
  justify-content: center;
  filter: blur(2px); /* Применяем размытие к этому элементу */
  transition: all 0.25s;
}

.dropdown-message {
  display: none;
  position: absolute;
  right: 6px;
  top: 8px;
  transition: all 0.25s;
}

.dropdown-message-message {
  position: absolute;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background-color: #e1ffc7;
  display: none;
  align-items: center;
  justify-content: center;
  filter: blur(2px); /* Применяем размытие к этому элементу */
  transition: all 0.25s;
}

.icon-container {
  display: flex;
  align-items: center;
}

.state-img {
  width: 14px;
}

.svg-icon {
  fill: rgb(110, 110, 110);
}

.message-icon {
  width: 20px; /* Ширина иконки */
  height: 20px; /* Высота иконки */
  margin-left: 5px; /* Отступ слева от текста сообщения */
}

.no-message-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.content-file {
  cursor: pointer;
}

.change-message {
  font-size: 16px;
  font-weight: 500;
  background-color: #f1f1f1;
  padding: 4px 10px;
  border-radius: 20px;
}

.geo-message {
  font-weight: 400;
  font-size: 16px;
  color: #000;
  font-style: italic;
}

.app-section {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.chat-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
}

.message-section {
  flex: 1; /* Позволяет занимать оставшееся пространство */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f9f9f9;
  position: relative;
  max-height: 100vh;
  min-height: 100vh;
}

/* Добавляем стили для плашки даты */
.date-separator {
  position: relative;
  margin: 15px auto;
  padding: 5px 12px;
  background-color: #e1f3fb;
  color: #555;
  border-radius: 20px;
  font-size: 12px;
  width: fit-content;
  z-index: 1;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.user-chat-icon-svg path#icon {
  cursor: pointer;
  fill: #808080; /* Серый цвет для всей иконки */
}

.user-info-section {
  z-index: 5;
  position: absolute;
  margin-top: 10px;
  padding-left: 18px;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  box-sizing: border-box;
}

.name-user {
  font-weight: 400;
  font-size: 16px;
  color: #000;
  margin-bottom: -5px;
}

.video-message {
  width: 250px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.audio-message {
  width: 300px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.sticker {
  width: 100px;
  border-radius: 10px;
}

.img-message {
  border-radius: 10px;
  width: 350px;
  cursor: pointer;
}

.status-user {
  font-weight: 400;
  font-size: 12px;
  color: #969696;
}

.error-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 94vh;
}

.error-section h2 {
  font-size: 14px;
  font-weight: 500;
}

.user-img {
  width: 35px;
  height: 35px;
  border-radius: 100px;
  cursor: pointer;
}

.message {
  position: relative;
  padding: 10px;
  transition: all 0.25s;
  cursor: pointer;
}

/* Уменьшенный паддинг для сообщений с контентом */
.has-content {
  padding: 5px; /* Уменьшенный паддинг для сообщений с контентом */
}

/* Уменьшенный паддинг для исходящих сообщений с контентом */
.outgoing.has-content {
  padding: 6px; /* Уменьшенный паддинг для исходящих сообщений с контентом */
}

/* Уменьшенный паддинг для входящих сообщений с контентом */
.incoming.has-content {
  padding: 6px; /* Уменьшенный паддинг для входящих сообщений с контентом */
}

.message-text-delete {
  font-style: italic;
}

.reply-content {
  height: 40px;
  background-color: #c6e2ad;
  width: 98%;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 6px solid #06cf9c;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.reply-name {
  font-size: 12px;
  font-weight: 500;
  color: #06cf9c;
  margin-left: 10px;
  margin-right: 10px;
}

.reply-text {
  font-size: 12px;
  font-weight: 500;
  color: #636363;
  margin-left: 10px;
  margin-right: 10px;
}

.outgoing {
  margin: 5px 30px;
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  align-self: flex-end;
  background-color: #e1ffc7;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* .outgoing:hover .send-reaction-icon-cont {
  display: flex;
} */

/* .send-reaction-icon:hover {
  display: flex;
} */

.incoming {
  margin: 5px 30px;
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  align-self: flex-start;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  background: #f1f1f1;
}

.outgoing::before {
  content: "";
  position: absolute;
  top: 0;
  right: -14px;
  width: 20px;
  height: 20px;
  background-color: red;
  background: linear-gradient(
    135deg,
    #e1ffc7 0%,
    #e1ffc7 50%,
    transparent 50%,
    transparent
  );
}

.incoming::before {
  content: "";
  position: absolute;
  top: 0;
  left: -14px;
  width: 20px;
  height: 20px;
  background-color: red;
  background: linear-gradient(
    225deg,
    #f1f1f1 0%,
    #f1f1f1 50%,
    transparent 50%,
    transparent
  );
}

.message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-time {
  font-size: 12px;
  color: #888;
}

.phone-out {
  display: none;
}

.out-text {
  margin-top: -2px;
  color: #bcbcbc;
  font-weight: 400;
}

footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

@media (max-width: 520px) {
  .img-message {
    border-radius: 10px;
    width: 250px;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .chat-container {
    width: 100%;
  }

  .no-message-section {
    display: none;
  }
  .error-section {
    flex-direction: column;
  }

  .error-section h2 {
    font-size: 14px;
  }
  .chat-container {
    height: calc(100vh - 40px);
  }

  .phone-out {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
}

@media (max-width: 400px) {
  .cont {
    align-items: flex-start;
  }

  .error-section h2 {
    font-size: 12px;
  }
}
</style>
