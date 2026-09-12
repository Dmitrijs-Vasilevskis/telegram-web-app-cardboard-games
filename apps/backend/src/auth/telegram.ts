import crypto from "crypto";
import { TELEGRAM_AUTH_MAX_AGE_SECONDS } from "../game/constants";

export interface TelegramAuthUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
}

export function validateTelegramInitData(rawInitData: string, botToken: string): TelegramAuthUser | null {
    try {
        const params = new URLSearchParams(rawInitData);
        const hash = params.get("hash");

        if (!hash) return null;

        params.delete("hash");

        const dataCheckArr: string[] = [];

        params.forEach((value, key) => {
            dataCheckArr.push(`${key}=${value}`);
        });

        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join("\n");

        const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
        const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

        if (calculatedHash !== hash) return null;

        const authDate = Number(params.get("auth_date"));

        if (!authDate || Number.isNaN(authDate)) return null;

        const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

        if (ageSeconds < 0 || ageSeconds > TELEGRAM_AUTH_MAX_AGE_SECONDS) return null;

        const userStr = params.get("user");

        if (!userStr) return null;

        return JSON.parse(userStr) as TelegramAuthUser;
    } catch (error) {
        console.error("Auth validation error:", error);

        return null;
    }
} 