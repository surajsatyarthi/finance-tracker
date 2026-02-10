import { test as base, expect } from '@playwright/test';
import { chromium, type BrowserContext } from '@playwright/test';

/**
 * Custom test fixture for using your Chrome profile with Supabase logged in
 */

type TestFixtures = {
  context: BrowserContext;
};

export const test = base.extend<TestFixtures>({
  context: async ({}, use) => {
    const userDataDir = `${process.env.HOME}/Library/Application Support/Google/Chrome`;
    const profileDir = 'Profile 6';
    
    const context = await chromium.launchPersistentContext(`${userDataDir}/${profileDir}`, {
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
      viewport: { width: 1280, height: 720 },
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
    await context.close();
  },
});

export { expect };
