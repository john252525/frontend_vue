import { createI18n } from "vue-i18n";
import Account from "./pages/Account.vue";
import GetScreen from "./components/Accounts/Accounts/ModalAccount/GetScreen.vue";
import { result } from "lodash";
import GetByCode from "./components/Accounts/Accounts/ModalAccount/GetByCode/GetByCode.vue";
import EditMailing from "./components/Mailing/ModalComponent/EditMailing/EditMailing.vue";
import { min } from "lodash";
import Checbox from "./components/Chats/UserList/newMessageComponent/Checbox.vue";
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();

const messages = {
  en: {
    welcome: "Welcome",
    buttons: {
      submit: "Submit",
      cancel: "Cancel",
    },
    account: {
      accounts: "Accounts",
      addButton: "Add",
    },
    accountList: {
      login: "LOGIN",
      step: "STEP",
      action: "ACTION",
      actionButton: "Action",
      accountNone: "There are no accounts.",
    },
    personalAccount: {
      out: "Exit",
      balance: "Your balance",
      depositBalance: "Top up your balance",
    },
    addAccount: {
      title: "Add accounts",
      typeCategory: "Select a category",
      typeMessanger: "Choose a messenger",
      addButton: "Add",
      login: "Login",
      token: "Token",
      crm: {
        takeAdres: "Enter the address of your CRM or select from the list",
        takeUrl: "Enter the URL of your Megaplan account",
      },
    },
    settings: {
      title: "Account Settings",
      subtitle: "Webhook URLs (start from a new line)",
      button: {
        loading: "Loading...",
        save: "Save",
      },
    },
    GetScreen: {
      close: "Close",
      text: "Generating an image...",
    },
    globalLoading: {
      loading: "Loading...",
      proxy: "Generating a proxy...",
      offAccount: "Account shutdown...",
      reset: "Account Reset...",
      delete: "Deleting an account...",
      generateCode: "Generating the code...",
      checkAccoutn: "Checking the account...",
    },
    confirmMoadal: {
      delete: {
        message: "Do you confirm the account deletion?",
        continue: "Continue",
        cancel: "Cancel",
      },
      reset: {
        message: "Do you confirm the account reset?",
        continue: "Cancel",
        cancel: "Continue",
      },
    },
    enable: {
      code: "Telegram code",
      next: "Next",
      qrTitle: "Link via QR scanning",
      codeTitle: "Link via code entry",
      ChallengeRequired: {
        title: "Link via QR scanning",
      },
    },
    result: {
      false: {
        button: "Repeat",
        message: {
          one: "Unknown error,",
          two: "please try again",
        },
      },
      true: "Successful authorization",
    },
    getByCode: {
      place: "Code",
      nextButton: "Next",
      login: "Login",
      close: "Close",
      loading: "Loading...",
    },
    mailing: {
      title: "Mailing list",
      button: "Add",
    },
    mailingList: {
      table: {
        name: "TITLE",
        data: "DATE OF CREATION",
        status: "STATUS",
        action: "ACTION",
      },
      name: "Newsletter",
      status: {
        active: "Active",
        noActive: "Inactive",
        completed: "completed",
      },
      noneMailing: "No accounts found",
      buttonActive: "Action",
      deleteMessageConfirm: "Deleting mailing lists",
    },

    information: {
      title: "Information",
      status: {
        title: "Status:",
        active: "Active",
        noActive: "Inactive",
      },
      name: "Name :",
      weekDay: "Days of the week:",
      time: "Time:",
      timeout: {
        title: "Delay:",
        min: "min",
      },
      message: "Messages:",
      button: "Edit",
    },
    editMailing: {
      title: "Editing mailing list",
      weekDay: "Days of the week",
      time: {
        title: "Time (Moscow Time)",
        c: "c",
        po: "by",
      },
      timeout: {
        title: "Delay between messages",
        ot: "by",
        do: "before",
        min: "min",
      },
      checbox: {
        one: "Delete duplicate contacts",
        two: "Send only through existing dialogs",
        three: "Send messages in random order",
      },
      button: "Save",
    },
    modalMailing: {
      on: "Enable",
      off: "Disable",
      info: "Info",
      edit: "Edit",
      delete: "Delete",
    },
    confirmDeleteMailing: {
      title: "Do you confirm the deletion of the newsletter?",
      next: "Continue",
      cansel: "Cancel",
    },
    resultModal: {
      messageTrue: "Operation completed successfully",
      messageFalse: "Error! The operation has been aborted",
    },
    messageList: {
      title: "List of Messages",
      table: {
        number: "Phone",
        text: "Text",
        status: "Status",
      },
      waitingSend: "Waiting for sending",
      loading: "Loading data...",
    },
    addMailing: {
      poleNumber: "Column with phone number",
      placeContact: `79111111111;olga 79111111111;ivan`,
      number: "Phone numbers",
      LoadFile: "Upload file",
      placeMessage: `Data from the uploaded database can be used in the text. Example: %G% (where G is another column)`,
      investment: "Attachment",
      name: "Title",
      weekDay: "Days of the week",
      time: "Time (GMT)",
      timeout: "Delay between messages",
      c: "c",
      po: "by",
      ot: "from",
      do: "before",
      min: "min",
      checkbox: {
        one: "Delete duplicate contacts",
        two: "Send only through existing dialogs",
        three: "Send messages randomly",
      },
      button: "Create",
    },
    paymentList: {
      paySistem: "PAYMENT SYSTEM",
      sum: "AMOUNT",
      date: "DATE",
      status: {
        table: "STATUS",
        cancelled: "Canceled",
        succeeded: "Paid",
        pending: "Pending",
      },
      accountNone: "No accounts available.",
    },
    depositPay: {
      title: "Top up the balance",
      placeSum: "Enter the amount",
      com: "Commission from 0%",
      button: "Top up the balance",
    },

    payment: {
      title: "Balance replenishment",
      button: "Top up",
    },
    nav: {
      account: "Accounts",
      mailing: "Mailing lists",
      chats: "Chats",
    },
    login: {
      title: "Authorization",
      mail: "Mail",
      password: "Password",
      errorPassword: "Enter the correct Password",
      errorMail: "Enter the correct E-mail",
      fogoutPassword: "Forgot your password?",
      button: "Log in",
      noAccaunt: "No account?",
      createAccount: "Create an account",
    },
    registration: {
      title: "Registration",
      mail: "Mail",
      password: "Password",
      passwordTwo: "Repeat password",
      checkbox: "I accept the Terms and Conditions",
      button: "Register",
      haveAccount: "Do you have an account?",
      login: "Log in",
    },
    fogoutPassword: {
      title: "Password Recovery",
      subtitle: `Enter your email address and we will send you a code to reset your
       password!`,
      mail: "Mail",
      send: "Send",
      pas: "Have you remembered your password? ",
      login: "Log in",
    },
    google: {
      text: "Log in Google",
    },
    modalAccount: {
      settings: "Settings",
      screen: "Screenshot",
      on: "Enable",
      off: "Disable",
      change: "Reset",
      chat: "Chat",
      changeProxy: "Change proxy",
      deleteAccount: "Delete account",
    },
  },
  ru: {
    welcome: "Добро пожаловать",
    buttons: {
      submit: "Отправить",
      cancel: "Отмена",
    },
    account: {
      accounts: "Аккаунты",
      addButton: "Добавить",
    },
    accountList: {
      login: "ЛОГИН",
      step: "ШАГ",
      action: "ДЕЙСТВИЕ",
      actionButton: "Действие",
      accountNone: "Аккаунты отсутствуют.",
    },
    personalAccount: {
      out: "Выйти",
      balance: "Ваш баланс",
      depositBalance: "Пополнить баланс",
    },
    addAccount: {
      title: "Добавить аккаунты",
      typeCategory: "Выберите категорию",
      typeMessanger: "Выберите мессенджер",
      addButton: "Добавить",
      login: "Логин",
      token: "Токен",
      crm: {
        takeAdres: "Введите адрес вашей CRM или выберите из списка",
        takeUrl: "Введите URL-адрес вашего аккаунта Megaplan",
      },
    },
    settings: {
      title: "Настройки аккаунта",
      subtitle: "Webhook URLs (указывать с новой строки)",
      button: {
        loading: "Загрузка...",
        save: "Сохранить",
      },
    },
    GetScreen: {
      close: "Закрыть",
      text: "Генерируем изображение...",
    },
    globalLoading: {
      loading: "Загрузка...",
      proxy: "Генерируем прокси...",
      offAccount: "Выключение аккаунта...",
      delete: "Удаление аккаунта...",
      reset: "Сброс аккаунта...",
      generateCode: "Генерируем код...",
      checkAccoutn: "Проверяем аккаунт...",
    },
    confirmMoadal: {
      delete: {
        message: "Вы подтверждаете удаление аккаунта?",
        continue: "Продолжить",
        cancel: "Отмена",
      },
      reset: {
        message: "Вы подтверждаете cброс аккаунта?",
        continue: "Продолжить",
        cancel: "Отмена",
      },
    },
    enable: {
      code: "Код Telegram",
      next: "Далее",
      qrTitle: "Связать через сканирование QR",
      codeTitle: "Связать через ввод кода",
      ChallengeRequired: {
        title: "Связать через сканирование QR",
      },
    },
    result: {
      false: {
        button: "Повторить",
        message: {
          one: "Неизвестная ошибка,",
          two: "пожалуйста, попробуйте еще раз",
        },
      },
      true: "Успешная авторизация",
    },
    getByCode: {
      place: "Код",
      nextButton: "Далее",
      login: "Логин",
      close: "Закрыть",
      loading: "Загрузка...",
    },
    mailing: {
      title: "Рассылки",
      button: "Добавить",
    },
    mailingList: {
      table: {
        name: "НАЗВАНИЕ",
        data: "ДАТА СОЗДАНИЯ",
        status: "СТАТУС",
        action: "ДЕЙСТВИЕ",
      },
      name: "Рассылка",
      status: {
        active: "Активен",
        noActive: "Неактивен",
        completed: "Завершена",
      },
      noneMailing: "Аккаунтов не найдено",
      buttonActive: "Действие",
      deleteMessageConfirm: "Удаление рассылки",
    },
    information: {
      title: "Информация",
      status: {
        title: "Статус:",
        active: "Активен",
        noActive: "Неактивен",
      },
      name: "Название:",
      weekDay: "Дни недели:",
      time: "Время",
      timeout: {
        title: "Задержка:",
        min: "мин",
      },
      message: "Сообщения:",
      button: "Редактировать",
    },
    editMailing: {
      title: "Редактирование рассылки",
      weekDay: "Дни недели",
      time: {
        title: "Время (по МСК)",
        c: "c",
        po: "по",
      },
      timeout: {
        title: "Задержка между сообщениями",
        ot: "от",
        do: "до",
        min: "мин",
      },
      checbox: {
        one: "Удалить дубликаты контактов",
        two: "Отправка только по уже существующим диалогам",
        three: "Отправлять сообщения в случайном порядке",
      },
      button: "Сохранить",
    },
    modalMailing: {
      on: "Включить",
      off: "Выключить",
      info: "Информация",
      edit: "Редактировать",
      delete: "Удалить",
    },
    confirmDeleteMailing: {
      title: "Вы подтверждаете удаление рассылки?",
      next: "Продолжить",
      cansel: "Отмена",
    },
    resultModal: {
      messageTrue: "Операция успешно выполнена",
      messageFalse: "Ошибка! Операция прервана",
    },
    messageList: {
      title: "Список Сообщений",
      table: {
        number: "Телефон",
        text: "Текст",
        status: "Статус",
      },
      waitingSend: "Ожидание отправки",
      loading: "Загрузка данных...",
    },
    addMailing: {
      poleNumber: "Столбец с номером телефона",
      placeContact: `79111111111;ольга
79111111111;иван`,
      number: "Номера телефонов",
      loadFile: "Загрузить файл",
      placeMessage: `В тексте можно использовать данные из загружаемой базы.
Пример: %G% (где G - другой столбец)`,
      investment: "Вложение",
      name: "Название",
      weekDay: "Дни недели",
      time: "Время (по МСК)",
      timeout: "Задержка между сообщениями",
      c: "c",
      po: "по",
      ot: "от",
      do: "до",
      min: "мин",
      checkbox: {
        one: "Удалить дубликаты контактов",
        two: "Отправка только по уже существующим диалогам",
        three: "Отправлять сообщения в случайном порядке",
      },
      button: "Создать",
    },
    paymentList: {
      paySistem: "ПЛАТЕЖНАЯ СИСТЕМА",
      sum: "СУММА",
      date: "ДАТА",
      status: {
        table: "СТАТУС",
        canceled: "Отменён",
        succeeded: "Оплачен",
        pending: "Ожидается",
      },
      accountNone: "Аккаунты отсутствуют.",
    },
    depositPay: {
      title: "Пополнение баланса",
      placeSum: "Введите сумму",
      com: "Комиссия от 0%",
      button: "Пополнить баланс",
    },
    payment: {
      title: "Пополение баланса",
      button: "Пополнить",
    },
    nav: {
      account: "Аккаунты",
      mailing: "Рассылки",
      chats: "Чаты",
    },
    login: {
      title: "Авторизация",
      mail: "Почта",
      password: "Пароль",
      errorPassword: "Введите корректный Пароль",
      errorMail: "Введите корректный E-mail",
      fogoutPassword: "Забыли пароль?",
      button: "Войти",
      noAccaunt: "Нет аккаунта?",
      createAccount: "Создать аккаунт",
    },
    registation: {
      title: "Регистрация",
      mail: "Почта",
      password: "Пароль",
      passwordTwo: "Повторите пароль",
      checkbox: "Я принимаю Положения и условия",
      button: "Зарегистрироваться",
      haveAccount: "Есть аккаунт?",
      login: "Войти",
    },
    fogoutPassword: {
      title: "Восстановление пароля",
      subtitle: `Введите свою электронную почту, и мы пришлем вам код для сброса вашего
        пароля!`,
      mail: "Почта",
      send: "Отправить",
      pas: "Вспомнили пароль? ",
      login: "Войти",
    },
    google: {
      text: "Войти через Google",
    },
    modalAccount: {
      settings: "Настройки",
      screen: "Скриншот",
      on: "Включить",
      off: "Выключить",
      change: "Сбросить",
      chat: "Чат",
      changeProxy: "Сменить прокси",
      deleteAccount: "Удалить аккаунт",
    },
  },
};

const i18n = createI18n({
  legacy: false, // для Composition API
  locale:
    window.location.hostname === "app1.developtech.ru"
      ? "en"
      : localStorage.getItem("lang") || "ru",
  fallbackLocale: "en",
  messages,
});

export default i18n;
