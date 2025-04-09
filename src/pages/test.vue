<template>
  <div>
    <div id="google-signin-button"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const handleCredentialResponse = async (response) => {
  console.log('Google token:', response.credential);
  
  try {
    // Отправляем токен НА ПРОДАКШЕН-БЭКЕНД
    const res = await fetch('https://hellychat.apitter.com/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential })
    });
    
    const data = await res.json();
    console.log('Auth result:', data);
    
    if (res.ok) {
      localStorage.setItem('auth_token', data.token);
      // Редирект или обновление состояния
    }
  } catch (err) {
    console.error('Auth error:', err);
  }
};

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: '536063598199-18bggcm8gcrsf1o92jejfkfmktt73c9g.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      ux_mode: 'popup' // Для localhost используем popup вместо redirect
    });
    
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large', width: 300 }
    );
  };
  document.head.appendChild(script);
});
</script>