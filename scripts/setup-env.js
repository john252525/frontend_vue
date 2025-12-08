import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateEnv(environment = "development") {
  const configPath = path.join(__dirname, "..", "env.config.json");

  if (!fs.existsSync(configPath)) {
    console.error("❌ env.config.json не найден");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  if (!config[environment]) {
    console.error(`❌ Окружение "${environment}" не найдено в конфиге`);
    process.exit(1);
  }

  const envConfig = {};
  for (const [key, value] of Object.entries(config[environment])) {
    if (typeof value === "string" && value.startsWith("$")) {
      const envVarName = value.slice(1);
      const envValue = process.env[envVarName];

      if (!envValue) {
        console.warn(
          `⚠️  Переменная окружения ${envVarName} не найдена для ${key}`
        );
      }

      envConfig[key] = envValue || value;
    } else {
      envConfig[key] = value;
    }
  }

  // Генерируем .env файл
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const envPath = path.join(__dirname, "..", ".env");
  fs.writeFileSync(envPath, envContent);

  console.log(`.env создан для окружения: ${environment}`);
}

generateEnv(process.argv[2]);
