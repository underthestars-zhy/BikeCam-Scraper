import puppeteer from "puppeteer";
import { TaskManager } from "./task-manager";
import UserAgent from 'user-agents';

export class TokenManager {
    private static instance: TokenManager;

    private sessID: string = ""

    private constructor() {
        this.refreshToken().then(() => TaskManager.getInstance())

        setInterval(() => this.refreshToken().then(), 1000 * 60 * 30);
    }

    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    public generateHeader(): { [key: string]: string } {
        return {
            "Host": "account.bluebikes.com",
            "Connection": "keep-alive",
            "Content-Length": "1049",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "content-type": "application/json",
            'Accept': 'application/json',
            "DNT": "1",
            "sec-ch-ua-mobile": "?0",
            "Origin": "https://account.bluebikes.com",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://account.bluebikes.com/map",
            "Accept-Language": "en-US,en;q=0.9",
            "Cookie": `sessId=${this.sessID}; bfe-fpval=0`
        }
    }

    private async refreshToken() {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--incognito',
            ],
        });

        try {
            const context = browser.defaultBrowserContext();
            const page = (await context.pages())[0]

            await page.setViewport({
                width: 1920 + Math.floor(Math.random() * 100),
                height: 3000 + Math.floor(Math.random() * 100),
                deviceScaleFactor: 1,
                hasTouch: false,
                isLandscape: false,
                isMobile: false,
            });

            const userAgent = new UserAgent({ platform: 'MacIntel', deviceCategory: 'desktop' });
            const userAgentStr = userAgent.toString() ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
            console.log(`User Agent: ${userAgentStr}`);

            await page.setUserAgent(userAgentStr)

            await page.goto('https://account.bluebikes.com/map');

            await page.waitForNetworkIdle()

            this.sessID = (await page.cookies()).find(c => c.name == 'sessId')?.value ?? ''
        } catch (e) {
            const errorTime = new Date().toISOString();
            console.error(`Error occurred at ${errorTime}:`, e);
        }

        await browser.close()
    }
}