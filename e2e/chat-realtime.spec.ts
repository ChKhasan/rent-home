import { APIRequestContext, Browser, BrowserContext, expect, Page, test } from '@playwright/test';

const webUrl = process.env['QA_CHAT_WEB_URL'] || 'http://localhost:3001';
const apiUrl = process.env['QA_CHAT_API_URL'] || 'http://localhost:8080';
const roomId = process.env['QA_CHAT_ROOM_ID'];
const alicePhone = process.env['QA_CHAT_ALICE_PHONE'];
const alicePassword = process.env['QA_CHAT_ALICE_PASSWORD'];
const bobPhone = process.env['QA_CHAT_BOB_PHONE'];
const bobPassword = process.env['QA_CHAT_BOB_PASSWORD'];
const hasFixture = !!(roomId && alicePhone && alicePassword && bobPhone && bobPassword);

test.describe('chat realtime two-context regression', () => {
  test.skip(!hasFixture, 'QA_CHAT_* credentials and room fixture are required.');
  test.describe.configure({ mode: 'serial' });

  test('keeps composers reachable and exchanges typing/messages securely', async ({ browser, request }) => {
    const alice = await authenticatedPage(browser, request, alicePhone!, alicePassword!, { width: 1280, height: 720 });
    const bob = await authenticatedPage(browser, request, bobPhone!, bobPassword!, { width: 1280, height: 720 });

    try {
      await Promise.all([
        alice.page.goto(`${webUrl}/profile/chat?roomId=${roomId}`),
        bob.page.goto(`${webUrl}/profile/chat?roomId=${roomId}`),
      ]);
      await Promise.all([
        expect(alice.page.getByLabel('Xabar matni')).toBeVisible(),
        expect(bob.page.getByLabel('Xabar matni')).toBeVisible(),
      ]);

      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 1440, height: 900 },
        { width: 1920, height: 1080 },
      ]) {
        await alice.page.setViewportSize(viewport);
        const desktopLayout = await composerLayout(alice.page);
        expect(desktopLayout.documentHeight).toBe(viewport.height);
        expect(desktopLayout.composerVisible).toBe(true);
        expect(desktopLayout.boardScrollable).toBe(true);
        expect(desktopLayout.newestVisible).toBe(true);
      }

      await alice.page.getByLabel('Xabar matni').fill('   ');
      await expect(alice.page.getByRole('button', { name: 'Xabar yuborish' })).toBeDisabled();

      const message = `QA chat E2E ${Date.now()}`;
      await alice.page.getByLabel('Xabar matni').fill(message);
      await expect(bob.page.locator('.chat-presence')).toContainText('yozmoqda');
      await alice.page.getByRole('button', { name: 'Xabar yuborish' }).click();
      await expect(bob.page.getByText(message, { exact: true }).last()).toBeVisible();

      await bob.page.setViewportSize({ width: 390, height: 844 });
      const mobileLayout = await composerLayout(bob.page);
      expect(mobileLayout.documentHeight).toBe(844);
      expect(mobileLayout.composerVisible).toBe(true);
      expect(mobileLayout.newestVisible).toBe(true);

      await bob.page.goto(`${webUrl}/profile/chat?roomId=999999`);
      await expect(bob.page.getByRole('alert')).toContainText('Suhbat ochilmadi');
      await expect(bob.page.getByLabel('Xabar matni')).toHaveCount(0);

      await alice.page.goto(`${webUrl}/profile`);
      await alice.page.getByRole('button', { name: 'Kabinetdan chiqish' }).click();
      await alice.page.getByRole('button', { name: 'Ha', exact: true }).click();
      await expect(alice.page).toHaveURL(`${webUrl}/`);
      expect(await alice.page.evaluate(() => localStorage.getItem('access_token'))).toBeNull();

      await bob.page.goto(`${webUrl}/profile/chat?roomId=${roomId}`);
      const privateMessage = `QA after logout ${Date.now()}`;
      await bob.page.getByLabel('Xabar matni').fill(privateMessage);
      await bob.page.getByRole('button', { name: 'Xabar yuborish' }).click();
      await alice.page.waitForTimeout(600);
      await expect(alice.page.locator('.p-toast-message')).toHaveCount(0);
      await expect(alice.page.getByText(privateMessage, { exact: true })).toHaveCount(0);
    } finally {
      await alice.context.close();
      await bob.context.close();
    }
  });
});

async function authenticatedPage(
  browser: Browser,
  request: APIRequestContext,
  phoneNumber: string,
  password: string,
  viewport: { width: number; height: number },
): Promise<{ context: BrowserContext; page: Page }> {
  const response = await request.post(`${apiUrl}/api/token/`, {
    data: { phone_number: phoneNumber, password },
  });
  expect(response.ok()).toBe(true);
  const tokens = await response.json();
  const context = await browser.newContext({ viewport });
  await context.addInitScript(({ origin, access, refresh }) => {
    if (location.origin !== origin) return;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }, { origin: new URL(webUrl).origin, access: tokens.access, refresh: tokens.refresh });
  return { context, page: await context.newPage() };
}

async function composerLayout(page: Page): Promise<{
  documentHeight: number;
  composerVisible: boolean;
  boardScrollable: boolean;
  newestVisible: boolean;
}> {
  return page.evaluate(() => {
    const composer = document.querySelector('.input-send')?.getBoundingClientRect();
    const board = document.querySelector('.board') as HTMLElement | null;
    const boardRect = board?.getBoundingClientRect();
    const newest = document.querySelector('.message-item')?.getBoundingClientRect();
    return {
      documentHeight: document.documentElement.scrollHeight,
      composerVisible: !!composer && composer.top >= 0 && composer.bottom <= innerHeight,
      boardScrollable: !!board && board.scrollHeight > board.clientHeight,
      newestVisible: !!newest && !!boardRect && newest.top >= boardRect.top && newest.bottom <= boardRect.bottom,
    };
  });
}
