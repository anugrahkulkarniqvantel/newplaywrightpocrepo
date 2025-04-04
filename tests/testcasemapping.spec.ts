import { test, expect } from '@playwright/test';

// Function to generate a unique value to automate New Customer Entries.
const generateUniqueValue = (prefix = '') => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

test('test', async ({ page }) => {

  // Timeout set for every page to load.
  test.setTimeout(120000);

  // LOGIN / SIGN-IN SECTION
  await page.goto('https://auth-q-sit-pf.qvantel.systems/auth/realms/qvantel/protocol/openid-connect/auth?ui_locales=en&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fsct-q-sit-pf.qvantel.systems%3A443%2Foauth2%2Fcallback&state=a43b005c-2253-4930-9670-c4e076d51186%7C%2F&client_id=sales-and-care-toolbox');
  await page.getByRole('textbox', { name: 'Username or email' }).fill('tom');
  await page.getByRole('textbox', { name: 'Password' }).fill('omission_bottom_tom');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Return to the start page' }).click();

  // Assertion: Verify successful login
  await expect(page.getByRole('heading', { name: 'Dashboard' }).locator('translate')).toBeVisible();

  // HOME DASHBOARD SECTION
  await page.getByRole('link', { name: ' Shop' }).click();
  await page.getByRole('link', { name: 'Mobile Postpaid' }).click();

  // Assertion: Verify navigation to Mobile Postpaid page
  await expect(page.getByRole('heading', { name: 'Mobile Postpaid' })).toBeVisible();

  // PERFORMING RISK ASSESSMENT
  await page.getByRole('button', { name: 'Perform risk assessment' }).click();
  await page.getByLabel('Identification type').selectOption('personal-identity-code');
  const uniqueIdentificationCode = generateUniqueValue('ID-');
  await page.getByRole('textbox', { name: 'Identification code *' }).fill(uniqueIdentificationCode);
  await page.getByLabel('Issuing country').selectOption('FI');
  const uniqueIssuingAuthority = generateUniqueValue('Auth-');
  await page.getByRole('textbox', { name: 'Issuing authority *' }).fill(uniqueIssuingAuthority);
  await page.getByRole('button', { name: 'Search' }).click();

  // Assertion: Verify no previous customer exists
  await expect(page.getByText('No previously stored customer')).toBeVisible();

  // NEW CUSTOMER ONBOARDING SECTION
  await page.getByLabel('Account type').selectOption('natural-person');
  const uniqueGivenName = generateUniqueValue('GN-');
  await page.getByRole('textbox', { name: 'Given Name *' }).fill(uniqueGivenName);
  await page.getByRole('textbox', { name: 'FamilyName *' }).fill(uniqueGivenName);
  await page.getByLabel('Country', { exact: true }).selectOption('FI');
  const uniqueCity = generateUniqueValue('City-');
  await page.getByRole('textbox', { name: 'City *' }).fill(uniqueCity);
  const uniqueStreet = generateUniqueValue('Street-');
  await page.getByRole('textbox', { name: 'Street *' }).fill(uniqueStreet);
  const uniquePostalCode = generateUniqueValue().slice(-6);
  await page.getByRole('textbox', { name: 'Postal code *' }).fill(uniquePostalCode);
  const uniqueEmail = `user${Date.now()}@test.com`;
  await page.getByRole('textbox', { name: 'john@doe.com' }).fill(uniqueEmail);
  const uniquePhoneNumber = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  await page.getByRole('textbox', { name: 'Phone Number' }).fill(uniquePhoneNumber);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Assertion: Verify user is on the Customer Plan Selection page
  await expect(page.getByText('Select a plan')).toBeVisible();

  // 5CUSTOMER PLAN SELECTION
  await page.waitForTimeout(3000);
  await page.getByRole('row', { name: 'Qvantel Super 5G  Postpaid' }).locator('sct-table-actions-common').getByRole('link').click();

  // Assertion: Verify plan selection
  await expect(page.getByText('Selected Plan: Qvantel Super 5G')).toBeVisible();

  // CONFIGURE SELECTED PLAN
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.locator('sct-flowable').filter({ hasText: 'Geo Localization consent' }).getByRole('button').click();
  await page.locator('sct-flowable').filter({ hasText: 'StockPriceQRP-automation-' }).getByRole('button').click();

  // Assertion: Verify MSISDN Selection
  await page.waitForTimeout(3000);
  const allTextElements = await page.locator('div').allInnerTexts();
  let qrpNumber: string | null = null;
  for (const text of allTextElements) {
    const trimmedText = text.trim();
    if (/^348\d{8}$/.test(trimmedText)) {
      qrpNumber = trimmedText;
      console.log("Found QRP Number:", qrpNumber);
      break;
    }
  }
  if (qrpNumber) {
    await page.getByText(qrpNumber, { exact: true }).click();
  } else {
    throw new Error("Script either could not find a unique MSISDN or could not select any MSISDN option.");
  }

  await page.getByRole('button', { name: 'Continue' }).first().click();

  // Assertion: Verify user reaches the Confirm page
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();

  // TERMS SELECTION
  await page.locator('.custom-control').first().click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(3000);
  await page.locator("//span[normalize-space()='Continue']").click();

  // Assertion: Verify Configure Optional Terms page
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

  // BASKET REVIEW & CHECKOUT
  await page.getByRole('button', { name: 'Go to checkout' }).click();

  // Assertion: Verify checkout page loads
  await expect(page.getByText('Order Summary')).toBeVisible();

  // PAYMENT SECTION
  await page.getByLabel('Select payment method').selectOption('invoice');
  await page.getByRole('button', { name: 'Submit' }).click();

  // Assertion: Verify successful payment processing
  await expect(page.getByText('Payment successful')).toBeVisible();

  // CUSTOMER ONBOARDING VERIFICATION
  await page.getByRole('textbox', { name: 'Type Customer name' }).click();
  await page.getByRole('textbox', { name: 'Type Customer name' }).fill(uniqueGivenName);
  await page.locator('button[name="submit-search"]').click();

  // Assertion: Verify customer is created and visible in search results
  await expect(page.getByText(uniqueGivenName)).toBeVisible();

  // Assertion: Verify order status is completed
  await page.getByRole('link', { name: ' Orders' }).click();
  await expect(page.getByText('Completed').first()).toBeVisible();
});

