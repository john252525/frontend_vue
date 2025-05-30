<template>
  <div @click="changeChatMenuStation" class="black-fon"></div>
  <div class="menu">
    <nav>
      <ul @click="copyUserLink">
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4A4A4A"
              d="M11 6.914V2.586L6.293 7.293l-3.774 3.774l3.841 3.201L11 18.135V13.9c8.146-.614 11 4.1 11 4.1c0-2.937-.242-5.985-2.551-8.293C16.765 7.022 12.878 6.832 11 6.914"
            />
          </svg>
          Поделиться
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { toRefs } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

const props = defineProps({
  changeChatMenuStation: {
    type: Function,
  },
  chatInfoValue: {
    type: Object,
  },
});

const { chatInfoValue } = toRefs(props);

const copyUserLink = () => {
  let userLink;
  if (route.query.multi) {
    userLink = `${window.location.origin}/#/chats?mode=widget&multi=true&source=${chatInfoValue.value.sourceUser}&login=${chatInfoValue.value.loginUser}&thread=${chatInfoValue.value.lastMessage.id.remote}`;
  } else {
    userLink = `${window.location.origin}/#/chats?mode=widget&source=${chatInfoValue.value.sourceUser}&login=${chatInfoValue.value.loginUser}&thread=${chatInfoValue.value.lastMessage.id.remote}`;
  }

  const userLogin = JSON.parse(localStorage.getItem("userInfo"));
  console.log(userLogin);
  navigator.clipboard
    .writeText(userLink)
    .then(() => {
      // Show success message (you can use a toast or alert)
      alert("Ссылка скопирована в буфер обмена");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      alert("Не удалось скопировать ссылку");
    });
};
</script>

<style scoped>
.menu {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50px;
  right: 20px;
  width: 140px;
  background-color: rgb(247, 247, 247);
  z-index: 100;
  border-radius: 5px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02);
}

ul {
  padding: 6px;
}

li {
  font-weight: 400;
  color: #4a4a4a;
  cursor: pointer;
  padding: 2px;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 2px;
}

li:hover {
  background-color: rgb(238, 238, 238);
  border-radius: 5px;
  padding: 2px 10px;
  transition: all 0.25s;
  color: black;
}
</style>
