<template>
  <aside
    class="pc-menu"
    v-if="!isChatPage && stationDomen.navigate.value === 'whatsapi'"
  >
    <nav>
      <!-- <ThemeTogle /> -->
      <LangSwither class="theme-block" />
      <ul>
        <!-- <li class="list" @click="navigateTo('/')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
            ></path>
          </svg>
          <p class="page">Главная</p>
        </li> -->
        <li class="list" @click="navigateTo('accounts')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
            ></path>
          </svg>
          <p class="page">{{ t("nav.account") }}</p>
        </li>
        <li class="list" @click="navigateTo('Mailing')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            class="svg-icon"
          >
            <path
              d="M8 5c-3.3 0-6 2.7-6 6c0 2 1 3.8 2.5 4.8C1.8 17.2 0 19.9 0 23h2c0-3.3 2.7-6 6-6s6 2.7 6 6h2c0-3.2 2.6-5.9 5.8-6h.2c2.5 0 4.6-1.5 5.5-3.6c0 0 0-.1.1-.1c.1-.1.1-.3.1-.4c0-.1 0-.1.1-.2c0-.1.1-.3.1-.4c0-.1 0-.2.1-.3c0-.1 0-.2.1-.3v-.6c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 2 1 3.8 2.5 4.8c-1.5.7-2.7 1.9-3.5 3.3c-.8-1.4-2-2.6-3.5-3.3C13 14.8 14 13 14 11c0-3.3-2.7-6-6-6m0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m14 0c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m2.1 11v2.1c-.6.1-1.2.4-1.7.7l-1.5-1.5l-1.4 1.4l1.5 1.5c-.4.5-.6 1.1-.7 1.8H18v2h2.1c.1.6.4 1.2.7 1.8l-1.5 1.5l1.4 1.4l1.5-1.5c.5.3 1.1.6 1.7.7V32h2v-2.1c.6-.1 1.2-.4 1.7-.7l1.5 1.5l1.4-1.4l-1.5-1.5c.4-.5.6-1.1.7-1.8H32v-2h-2.1c-.1-.6-.4-1.2-.7-1.8l1.5-1.5l-1.4-1.4l-1.5 1.5c-.5-.3-1.1-.6-1.7-.7V18zm.9 4c1.7 0 3 1.3 3 3s-1.3 3-3 3s-3-1.3-3-3s1.3-3 3-3m0 2a.872.872 0 0 0-.367.086a1.138 1.138 0 0 0-.32.227a1.138 1.138 0 0 0-.227.32A.872.872 0 0 0 24 25c0 .125.031.25.086.367c.055.117.133.227.227.32c.093.094.203.172.32.227A.872.872 0 0 0 25 26c.5 0 1-.5 1-1s-.5-1-1-1"
            />
          </svg>
          <p class="page">{{ t("nav.mailing") }}</p>
        </li>
        <li v-if="apiUrl === apiCheckUrl" @click="navigateToChats" class="list">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 256 256"
          >
            <path
              d="M216 80h-32V48a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v128a8 8 0 0 0 13 6.22L72 154v30a16 16 0 0 0 16 16h93.59L219 230.22a8 8 0 0 0 5 1.78a8 8 0 0 0 8-8V96a16 16 0 0 0-16-16M66.55 137.78L40 159.25V48h128v88H71.58a8 8 0 0 0-5.03 1.78M216 207.25l-26.55-21.47a8 8 0 0 0-5-1.78H88v-32h80a16 16 0 0 0 16-16V96h32Z"
            />
          </svg>
          <p class="page">{{ t("nav.chats") }}</p>
        </li>
        <!-- <li v-if="stationDomen.navigate.value === 'settings'">dddd</li> -->
      </ul>
      <ul v-if="isOpen">
        <li @click="navigateTo('/chatsdatabase')" class="drop-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
            />
          </svg>
          <p class="page-drop">{{ t("nav.chats") }}</p>
        </li>
        <li @click="navigateTo('/messagesdatabase')" class="drop-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
            />
          </svg>
          <p class="page-drop">Сообщения</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>
  <aside
    class="pc-menu"
    v-if="!isChatPage && stationDomen.navigate.value === 'settings'"
  >
    <nav>
      <ul>
        <li class="list" @click="navigateTo('settings')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 32 32"
          >
            <path
              d="M27 16.76v-1.53l1.92-1.68A2 2 0 0 0 29.3 11l-2.36-4a2 2 0 0 0-1.73-1a2 2 0 0 0-.64.1l-2.43.82a11.35 11.35 0 0 0-1.31-.75l-.51-2.52a2 2 0 0 0-2-1.61h-4.68a2 2 0 0 0-2 1.61l-.51 2.52a11.48 11.48 0 0 0-1.32.75l-2.38-.86A2 2 0 0 0 6.79 6a2 2 0 0 0-1.73 1L2.7 11a2 2 0 0 0 .41 2.51L5 15.24v1.53l-1.89 1.68A2 2 0 0 0 2.7 21l2.36 4a2 2 0 0 0 1.73 1a2 2 0 0 0 .64-.1l2.43-.82a11.35 11.35 0 0 0 1.31.75l.51 2.52a2 2 0 0 0 2 1.61h4.72a2 2 0 0 0 2-1.61l.51-2.52a11.48 11.48 0 0 0 1.32-.75l2.42.82a2 2 0 0 0 .64.1a2 2 0 0 0 1.73-1l2.28-4a2 2 0 0 0-.41-2.51ZM25.21 24l-3.43-1.16a8.86 8.86 0 0 1-2.71 1.57L18.36 28h-4.72l-.71-3.55a9.36 9.36 0 0 1-2.7-1.57L6.79 24l-2.36-4l2.72-2.4a8.9 8.9 0 0 1 0-3.13L4.43 12l2.36-4l3.43 1.16a8.86 8.86 0 0 1 2.71-1.57L13.64 4h4.72l.71 3.55a9.36 9.36 0 0 1 2.7 1.57L25.21 8l2.36 4l-2.72 2.4a8.9 8.9 0 0 1 0 3.13L27.57 20Z"
            />
            <path
              d="M16 22a6 6 0 1 1 6-6a5.94 5.94 0 0 1-6 6m0-10a3.91 3.91 0 0 0-4 4a3.91 3.91 0 0 0 4 4a3.91 3.91 0 0 0 4-4a3.91 3.91 0 0 0-4-4"
            />
          </svg>

          <p class="page">Настройки</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>
  <aside
    class="pc-menu"
    v-if="!isChatPage && stationDomen.navigate.value === 'touchapi'"
  >
    <LangSwither class="theme-block" />
    <nav>
      <ul>
        <!-- <li class="list" @click="navigateTo('/')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="svg-icon"
          viewBox="0 0 16 16"
        >
          <path
            d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
          ></path>
        </svg>
        <p class="page">Главная</p>
      </li> -->
        <li class="list" @click="navigateTo('accounts')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
            ></path>
          </svg>
          <p class="page">{{ t("nav.account") }}</p>
        </li>
        <!-- <li class="list" @click="openList">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <g>
              <path
                d="M12.5 9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m.354 5.854l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V10.5a.5.5 0 0 0-1 0v2.793l-.646-.647a.5.5 0 0 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0"
              />
              <path
                d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"
              />
            </g>
          </svg>
          <p class="page">База данных</p>
        </li> -->
      </ul>
      <ul v-if="isOpen">
        <li @click="navigateTo('/chatsdatabase')" class="drop-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
            />
          </svg>
          <p class="page-drop">{{ t("nav.chats") }}</p>
        </li>
        <li @click="navigateTo('/messagesdatabase')" class="drop-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
            />
          </svg>
          <p class="page-drop">Сообщения</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>
  <div
    v-if="phoneMenuStation && (chatStation || isChatPage)"
    class="black-fon"
    @click="phoneMenuOn"
  >
    <aside class="phone-menu" :class="{ active: phoneMenuStation }" @click.stop>
      <div class="logo-header-cont">
        <h2 class="logo-header">
          <img
            :src="stationDomen.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          {{ stationDomen.cosmetics.titleLogo }}
        </h2>
      </div>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <!-- <li class="list" @click="clickMenu('/')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
              ></path>
            </svg>
            <p class="page">Главная</p>
          </li> -->
          <li class="list" @click="clickMenu('accounts')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
              ></path>
            </svg>
            <p class="page">{{ t("nav.account") }}</p>
          </li>
          <li @click="clickMenu('mailing')" class="list">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              class="svg-icon"
            >
              <path
                d="M8 5c-3.3 0-6 2.7-6 6c0 2 1 3.8 2.5 4.8C1.8 17.2 0 19.9 0 23h2c0-3.3 2.7-6 6-6s6 2.7 6 6h2c0-3.2 2.6-5.9 5.8-6h.2c2.5 0 4.6-1.5 5.5-3.6c0 0 0-.1.1-.1c.1-.1.1-.3.1-.4c0-.1 0-.1.1-.2c0-.1.1-.3.1-.4c0-.1 0-.2.1-.3c0-.1 0-.2.1-.3v-.6c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 2 1 3.8 2.5 4.8c-1.5.7-2.7 1.9-3.5 3.3c-.8-1.4-2-2.6-3.5-3.3C13 14.8 14 13 14 11c0-3.3-2.7-6-6-6m0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m14 0c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m2.1 11v2.1c-.6.1-1.2.4-1.7.7l-1.5-1.5l-1.4 1.4l1.5 1.5c-.4.5-.6 1.1-.7 1.8H18v2h2.1c.1.6.4 1.2.7 1.8l-1.5 1.5l1.4 1.4l1.5-1.5c.5.3 1.1.6 1.7.7V32h2v-2.1c.6-.1 1.2-.4 1.7-.7l1.5 1.5l1.4-1.4l-1.5-1.5c.4-.5.6-1.1.7-1.8H32v-2h-2.1c-.1-.6-.4-1.2-.7-1.8l1.5-1.5l-1.4-1.4l-1.5 1.5c-.5-.3-1.1-.6-1.7-.7V18zm.9 4c1.7 0 3 1.3 3 3s-1.3 3-3 3s-3-1.3-3-3s1.3-3 3-3m0 2a.872.872 0 0 0-.367.086a1.138 1.138 0 0 0-.32.227a1.138 1.138 0 0 0-.227.32A.872.872 0 0 0 24 25c0 .125.031.25.086.367c.055.117.133.227.227.32c.093.094.203.172.32.227A.872.872 0 0 0 25 26c.5 0 1-.5 1-1s-.5-1-1-1"
              />
            </svg>
            <p class="page">{{ t("nav.mailing") }}</p>
          </li>
          <li
            v-if="apiUrl === apiCheckUrl"
            @click="navigateToChats"
            class="list"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 256 256"
            >
              <path
                d="M216 80h-32V48a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v128a8 8 0 0 0 13 6.22L72 154v30a16 16 0 0 0 16 16h93.59L219 230.22a8 8 0 0 0 5 1.78a8 8 0 0 0 8-8V96a16 16 0 0 0-16-16M66.55 137.78L40 159.25V48h128v88H71.58a8 8 0 0 0-5.03 1.78M216 207.25l-26.55-21.47a8 8 0 0 0-5-1.78H88v-32h80a16 16 0 0 0 16-16V96h32Z"
              />
            </svg>
            <p class="page">{{ t("nav.chats") }}</p>
          </li>
          <li class="list" @click="openList">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <g>
                <path
                  d="M12.5 9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m.354 5.854l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V10.5a.5.5 0 0 0-1 0v2.793l-.646-.647a.5.5 0 0 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0"
                />
                <path
                  d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"
                />
              </g>
            </svg>
            <p class="page">База данных</p>
          </li>
        </ul>
        <ul v-if="isOpen">
          <li @click="clickMenu('/chatsdatabase')" class="drop-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
              />
            </svg>
            <p class="page-drop">{{ t("nav.chats") }}</p>
          </li>
          <li @click="clickMenu('/messagesdatabase')" class="drop-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"
              />
            </svg>
            <p class="page-drop">Сообщения</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
  <div
    v-if="
      phoneMenuStation &&
      (chatStation || isChatPage) &&
      stationDomen.navigate.value === 'whatsapi'
    "
    class="black-fon"
    @click="phoneMenuOn"
  >
    <aside class="phone-menu" :class="{ active: phoneMenuStation }" @click.stop>
      <LangSwither class="theme-block" />
      <div class="logo-header-cont">
        <h2 class="logo-header">
          <img
            :src="stationDomen.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          {{ stationDomen.cosmetics.titleLogo }}
        </h2>
      </div>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <!-- <li class="list" @click="clickMenu('/')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
              ></path>
            </svg>
            <p class="page">Главная</p>
          </li> -->
          <li class="list" @click="clickMenu('accounts')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
              ></path>
            </svg>
            <p class="page">{{ t("nav.account") }}</p>
          </li>
          <li class="list" @click="clickMenu('mailing')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              class="svg-icon"
            >
              <path
                d="M8 5c-3.3 0-6 2.7-6 6c0 2 1 3.8 2.5 4.8C1.8 17.2 0 19.9 0 23h2c0-3.3 2.7-6 6-6s6 2.7 6 6h2c0-3.2 2.6-5.9 5.8-6h.2c2.5 0 4.6-1.5 5.5-3.6c0 0 0-.1.1-.1c.1-.1.1-.3.1-.4c0-.1 0-.1.1-.2c0-.1.1-.3.1-.4c0-.1 0-.2.1-.3c0-.1 0-.2.1-.3v-.6c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 2 1 3.8 2.5 4.8c-1.5.7-2.7 1.9-3.5 3.3c-.8-1.4-2-2.6-3.5-3.3C13 14.8 14 13 14 11c0-3.3-2.7-6-6-6m0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m14 0c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4m2.1 11v2.1c-.6.1-1.2.4-1.7.7l-1.5-1.5l-1.4 1.4l1.5 1.5c-.4.5-.6 1.1-.7 1.8H18v2h2.1c.1.6.4 1.2.7 1.8l-1.5 1.5l1.4 1.4l1.5-1.5c.5.3 1.1.6 1.7.7V32h2v-2.1c.6-.1 1.2-.4 1.7-.7l1.5 1.5l1.4-1.4l-1.5-1.5c.4-.5.6-1.1.7-1.8H32v-2h-2.1c-.1-.6-.4-1.2-.7-1.8l1.5-1.5l-1.4-1.4l-1.5 1.5c-.5-.3-1.1-.6-1.7-.7V18zm.9 4c1.7 0 3 1.3 3 3s-1.3 3-3 3s-3-1.3-3-3s1.3-3 3-3m0 2a.872.872 0 0 0-.367.086a1.138 1.138 0 0 0-.32.227a1.138 1.138 0 0 0-.227.32A.872.872 0 0 0 24 25c0 .125.031.25.086.367c.055.117.133.227.227.32c.093.094.203.172.32.227A.872.872 0 0 0 25 26c.5 0 1-.5 1-1s-.5-1-1-1"
              />
            </svg>
            <p class="page">{{ t("nav.mailing") }}</p>
          </li>
          <li
            v-if="apiUrl === apiCheckUrl"
            @click="navigateToChats"
            class="list"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 256 256"
            >
              <path
                d="M216 80h-32V48a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v128a8 8 0 0 0 13 6.22L72 154v30a16 16 0 0 0 16 16h93.59L219 230.22a8 8 0 0 0 5 1.78a8 8 0 0 0 8-8V96a16 16 0 0 0-16-16M66.55 137.78L40 159.25V48h128v88H71.58a8 8 0 0 0-5.03 1.78M216 207.25l-26.55-21.47a8 8 0 0 0-5-1.78H88v-32h80a16 16 0 0 0 16-16V96h32Z"
              />
            </svg>
            <p class="page">{{ t("nav.chats") }}</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
  <div
    v-if="
      phoneMenuStation &&
      (chatStation || isChatPage) &&
      stationDomen.navigate.value === 'touchapi'
    "
    class="black-fon"
    @click="phoneMenuOn"
  >
    <aside class="phone-menu" :class="{ active: phoneMenuStation }" @click.stop>
      <LangSwither class="theme-block" />
      <div class="logo-header-cont">
        <h2 class="logo-header">
          <img
            :src="stationDomen.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          {{ stationDomen.cosmetics.titleLogo }}
        </h2>
      </div>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <!-- <li class="list" @click="clickMenu('/')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
              ></path>
            </svg>
            <p class="page">Главная</p>
          </li> -->
          <li class="list" @click="clickMenu('accounts')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
              ></path>
            </svg>
            <p class="page">{{ t("nav.account") }}</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
  <div
    v-if="
      phoneMenuStation &&
      (chatStation || isChatPage) &&
      stationDomen.navigate.value === 'settings'
    "
    class="black-fon"
    @click="phoneMenuOn"
  >
    <aside class="phone-menu" :class="{ active: phoneMenuStation }" @click.stop>
      <LangSwither class="theme-block" />
      <div class="logo-header-cont">
        <h2 class="logo-header">
          <img
            :src="stationDomen.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          {{ stationDomen.cosmetics.titleLogo }}
        </h2>
      </div>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <li class="list" @click="clickMenu('settings')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 32 32"
            >
              <path
                d="M27 16.76v-1.53l1.92-1.68A2 2 0 0 0 29.3 11l-2.36-4a2 2 0 0 0-1.73-1a2 2 0 0 0-.64.1l-2.43.82a11.35 11.35 0 0 0-1.31-.75l-.51-2.52a2 2 0 0 0-2-1.61h-4.68a2 2 0 0 0-2 1.61l-.51 2.52a11.48 11.48 0 0 0-1.32.75l-2.38-.86A2 2 0 0 0 6.79 6a2 2 0 0 0-1.73 1L2.7 11a2 2 0 0 0 .41 2.51L5 15.24v1.53l-1.89 1.68A2 2 0 0 0 2.7 21l2.36 4a2 2 0 0 0 1.73 1a2 2 0 0 0 .64-.1l2.43-.82a11.35 11.35 0 0 0 1.31.75l.51 2.52a2 2 0 0 0 2 1.61h4.72a2 2 0 0 0 2-1.61l.51-2.52a11.48 11.48 0 0 0 1.32-.75l2.42.82a2 2 0 0 0 .64.1a2 2 0 0 0 1.73-1l2.28-4a2 2 0 0 0-.41-2.51ZM25.21 24l-3.43-1.16a8.86 8.86 0 0 1-2.71 1.57L18.36 28h-4.72l-.71-3.55a9.36 9.36 0 0 1-2.7-1.57L6.79 24l-2.36-4l2.72-2.4a8.9 8.9 0 0 1 0-3.13L4.43 12l2.36-4l3.43 1.16a8.86 8.86 0 0 1 2.71-1.57L13.64 4h4.72l.71 3.55a9.36 9.36 0 0 1 2.7 1.57L25.21 8l2.36 4l-2.72 2.4a8.9 8.9 0 0 1 0 3.13L27.57 20Z"
              />
              <path
                d="M16 22a6 6 0 1 1 6-6a5.94 5.94 0 0 1-6 6m0-10a3.91 3.91 0 0 0-4 4a3.91 3.91 0 0 0 4 4a3.91 3.91 0 0 0 4-4a3.91 3.91 0 0 0-4-4"
              />
            </svg>

            <p class="page">Настройки</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
import LangSwither from "../LangSwither.vue";
import Spinner from "./Spinner.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  phoneMenuOn: Function,
  phoneMenuStation: Boolean,
  chatStation: Boolean,
  chatsLoading: Boolean,
});

const logo = import.meta.env.VITE_TITLE_LOGO;
const logoUrl = import.meta.env.VITE_URL_LOGO;

const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;
const apiUrl = import.meta.env.VITE_API_URL;
const route = useRoute();
const router = useRouter();
const isOpen = ref(false);

const openList = () => {
  isOpen.value = !isOpen.value;
};

const navigateToChats = () => {
  router.push({ name: "Chats", query: { mode: "widget", multi: true } });
};

const clickMenu = (page) => {
  props.phoneMenuOn();
  router.push(page);
};

const navigateTo = (page) => {
  router.push(page);
};

const isChatPage = computed(() => {
  return route.name === "Chats";
});
</script>

<style scoped>
.pc-menu {
  display: flex;
  width: 230px;
  /* height: calc(100vh - 57  px); */
  box-sizing: border-box;
  background: var(--bg);
}

nav {
  margin-top: 20px;
  margin-left: 8px;
}

.logo-header {
  font-family: system-ui;
  font-weight: 500;
  font-size: 24px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.svg-icon {
  width: 22px; /* 24px */
  height: 22px; /* 24px */
  fill: var(--svgColor); /* Tailwind gray-500 */
  transition: all 75ms; /* Переход для всех свойств за 75 мс */
}

.line {
  width: 0.5px;
  background-color: var(--line);
  position: absolute;
  z-index: 2;
  top: 45px;
  height: calc(100% - 57px);
  left: 230px;
}

.logo-img {
  height: 2rem;
}

.list-chats-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.list-chats-loading.disabled {
  opacity: 0.5; /* Делаем элемент полупрозрачным */
  pointer-events: none; /* Отключаем возможность клика */
  cursor: not-allowed; /* Меняем курсор на "запрещено" */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.list {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 20px;
  cursor: pointer;
  /* background-color: red; */
}

.drop-item:hover {
  background-color: #eeeeee;
  border-radius: 10px;
  width: 190px;
}

.drop-item:hover .svg-icon path {
  fill: #111827;
}

.theme-block {
  position: absolute;
  bottom: 0;
  left: 0;
}

.page {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: var(--text);
}

.page-drop {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: black;
}

.list:hover {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 200px;
}

.list:hover .svg-icon path {
  fill: var(--iconNavHover);
}

.phone-menu nav ul {
  opacity: 0;
  transition: opacity 0.2s ease-in-out 0.1s;
}

.phone-menu.active nav ul {
  opacity: 1;
}

.phone-menu-chat {
  width: 260px;
  height: 100vh;
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  background-color: white;
}

.phone-menu {
  position: fixed;
  top: 0;
  left: -230px; /* Скрыто за пределами экрана */
  width: 230px;
  height: 100vh;
  background: var(--bg);
  /* transition: all 0.3s ease; */
  z-index: 1000; /* Должен быть выше оверлея */
}

.phone-menu.active {
  left: 0;
  /* transition: all 0.3s ease; */
}

.phone-menu {
  will-change: transform, left;
}

.logo-phone-cont {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: 15px;
  margin-top: 20px;
}

.line-menu {
  width: 100%;
  height: 0.5px;
  background-color: #d9d9d9;
  margin-top: 20px;
  margin-bottom: 20px;
}

.logo-phone {
  font-weight: 600;
  font-size: 26px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-header-cont {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 215px;
  margin-left: 16px;
  margin-top: 20px;
}

.icon {
  width: 24px; /* Adjust the size if necessary */
  height: 24px; /* Adjust the size if necessary */
  fill: currentColor; /* Allows for color inheritance */
  transition: fill 0.3s; /* Smooth transition for color changes */
}

.icon:hover {
  fill: #1a202c; /* Change color on hover */
}

.dark .icon {
  fill: #a0aec0; /* Dark mode color */
}

.dark .icon:hover {
  fill: #f7fafc; /* Dark mode hover color */
}

@media (max-width: 768px) {
  .pc-menu {
    display: none; /* Hide PC menu on mobile */
  }

  .phone-menu {
    display: block; /* Show mobile menu */
  }
}
</style>
