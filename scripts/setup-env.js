import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_ALIASES = {
  dev: "development",
  prod: "production",
};

const LOCAL_BRAND_OVERRIDES = {
  "local-webest": "webest",
  "local-whatsapi": "whatsapi",
};

function buildDomainFields(domainConfigs) {
  return {
    VITE_DOMAINS: domainConfigs.map((d) => d.domain).join(","),
    VITE_NAVIGATE_VALUES: domainConfigs.map((d) => d.navigate).join(","),
    VITE_LOGOS: domainConfigs.map((d) => d.logo).join(","),
    VITE_TITLE_LOGOS: domainConfigs.map((d) => d.titleLogo).join(","),
    VITE_URL_LOGOS: domainConfigs.map((d) => d.urlLogo).join(","),
    VITE_ADDITIONAL_LOGOS: domainConfigs.map((d) => d.additionalLogo).join(","),
  };
}

function resolveScalarFields(section) {
  const result = {};
  for (const [key, value] of Object.entries(section)) {
    if (key === "domainConfigs") continue;

    if (typeof value === "string" && value.startsWith("$")) {
      const envVarName = value.slice(1);
      const envValue = process.env[envVarName];

      if (!envValue) {
        console.warn(
          `⚠️  Переменная окружения ${envVarName} не найдена для ${key}`,
        );
      }

      result[key] = envValue || value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function generateEnv(command = "development") {
  const configPath = path.join(__dirname, "..", "env.config.json");

  if (!fs.existsSync(configPath)) {
    console.error("❌ env.config.json не найден");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  let baseEnvKey;
  let brandOverride = null;

  if (LOCAL_BRAND_OVERRIDES[command]) {
    baseEnvKey = "development";
    brandOverride = LOCAL_BRAND_OVERRIDES[command];
  } else {
    baseEnvKey = ENV_ALIASES[command] || command;
  }

  const section = config[baseEnvKey];
  if (!section) {
    console.error(`❌ Окружение "${baseEnvKey}" не найдено в конфиге`);
    process.exit(1);
  }

  if (!Array.isArray(section.domainConfigs)) {
    console.error(`❌ В окружении "${baseEnvKey}" отсутствует domainConfigs`);
    process.exit(1);
  }

  // глубокая копия, чтобы не мутировать исходный объект конфига
  const domainConfigs = JSON.parse(JSON.stringify(section.domainConfigs));

  if (brandOverride) {
    const brand = config.brands?.[brandOverride];
    if (!brand) {
      console.error(`❌ Бренд "${brandOverride}" не найден в config.brands`);
      process.exit(1);
    }

    const localhostIndex = domainConfigs.findIndex(
      (d) => d.domain === "localhost",
    );

    if (localhostIndex === -1) {
      console.error(
        `❌ Запись для localhost не найдена в domainConfigs окружения "${baseEnvKey}"`,
      );
      process.exit(1);
    }

    domainConfigs[localhostIndex] = {
      ...domainConfigs[localhostIndex],
      ...brand,
      domain: "localhost",
    };
  }

  const envConfig = {
    ...resolveScalarFields(section),
    ...buildDomainFields(domainConfigs),
  };

  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const envPath = path.join(__dirname, "..", ".env");
  fs.writeFileSync(envPath, envContent);

  console.log(
    brandOverride
      ? `✅ .env создан для "${command}" (база: ${baseEnvKey}, localhost переопределён на бренд "${brandOverride}")`
      : `✅ .env создан для окружения: ${baseEnvKey}`,
  );
}

generateEnv(process.argv[2]);
