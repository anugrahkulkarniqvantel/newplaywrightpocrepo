import { test, expect } from '@playwright/test';

// Function to generate a unique value to automate New Customer Entries.
const generateUniqueValue = (prefix = '') => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

test('test', async ({ page }) => {
  
  // Timeout set for every page to load. 
  test.setTimeout(420000);

  // Login /Signin Section
  await page.goto('https://auth-q-sit-pf.qvantel.systems/auth/realms/qvantel/protocol/openid-connect/auth?ui_locales=en&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fsct-q-sit-pf.qvantel.systems%3A443%2Foauth2%2Fcallback&state=a43b005c-2253-4930-9670-c4e076d51186%7C%2F&client_id=sales-and-care-toolbox');
  await page.getByRole('textbox', { name: 'Username or email' }).fill('tom');
  await page.getByRole('textbox', { name: 'Password' }).fill('omission_bottom_tom');
  await page.getByRole('button', { name: 'Sign In' }).click();
  console.log("Login is Successfull!")
  await page.getByRole('link', { name: 'Return to the start page' }).click();
  console.log("Welcome to the Home Dashboard!")

  // Home Dashboard Section
  await page.getByRole('link', { name: ' Shop' }).click();
  await expect(page.getByRole('link', { name: 'Mobile Postpaid' })).toBeVisible();
  await page.getByRole('link', { name: 'Mobile Postpaid' }).click();

  // Performing Risk Assessment
  await page.getByRole('button', { name: 'Perform risk assessment' }).click();
  await page.getByLabel('Identification type').selectOption('personal-identity-code');
  const uniqueIdentificationCode = generateUniqueValue('ID-');
  await page.getByRole('textbox', { name: 'Identification code *' }).fill(uniqueIdentificationCode);
  await page.getByLabel('Issuing country').selectOption('FI');
  const uniqueIssuingAuthority = generateUniqueValue('Auth-');
  await page.getByRole('textbox', { name: 'Issuing authority *' }).fill(uniqueIssuingAuthority);
  await page.getByRole('button', { name: 'Search' }).click()

  // Risk Assessent Assertion
  try {
    await expect(page.getByText('No previously stored customer')).toBeVisible();
    console.log('Risk Assessment Completed! Customer is new, proceeding with customer onboarding.....');
  } catch (error) {
      if (await page.getByText('Recognized customer. Please').isVisible()) {
        console.error('Customer already exists. Closing the popup...');
        await page.locator('button').filter({ hasText: 'Close' }).click(); // Clicks the Close button
        throw new Error('Customer already exists. Test failed.');
      } else {
          throw error; // Re-throw any unexpected errors
      }
  }

  // New Customer Onboarding Section
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
  console.log("Customer Details Taken! Moving to Cutomer Plan Selection...")

  // Customer Plan Selection
  await page.waitForTimeout(3000);
  await page.getByRole('row', { name: 'Qvantel Super 5G  Postpaid' }).locator('sct-table-actions-common').getByRole('link').click();

  // Configure Selected Plan
    // 1> Select New Sim 
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  console.log("Sim Selected as Standard Delievery with Delivery Address as Postal Address.")

    // 2> Configure Marketing Permissions
  await page.locator('sct-flowable').filter({ hasText: 'Geo Localization consent' }).getByRole('button').click();
  console.log("Marketing permissions are successfully selected!")

    // 3> Select MSISDN
  await page.locator('sct-flowable').filter({ hasText: 'StockPriceQRP-automation-' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  const allTextElements = await page.locator('div').allInnerTexts();
  await page.waitForTimeout(2000);
  let qrpNumber: string | null = null;

  for (const text of allTextElements) {
    const trimmedText = text.trim();
        if (/^348\d{8}$/.test(trimmedText)) {
            qrpNumber = trimmedText;
            await expect(page.getByText(qrpNumber)).toBeVisible();
            console.log("Found New QRP Number:", qrpNumber);
            break;
        }
  }
  if (qrpNumber) {
      await page.getByText(qrpNumber, { exact: true }).click();
      console.log("New MSISDN Number Selected:", qrpNumber)
  } else {
        throw new Error("Script either could not find a unique MSISDN or could not select any MSISDN option. ");
  }
  await page.getByRole('button', { name: 'Continue' }).first().click();
  
  // Select Term
  await page.locator('.custom-control').first().click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  console.log('All configurations for Selected Plan have been completed! Please click on Continue to Proceed. ')
  await page.waitForTimeout(3000);
  await page.locator("//span[normalize-space()='Continue']").click();

  await page.getByRole('button', { name: 'Continue' }).click(); // Configure Optional Terms

  await page.getByRole('button', { name: 'Continue' }).click(); // Available Upsell Offers

  await expect(page.getByRole('heading', { name: 'Plan summary' })).toBeVisible();// Plan Summary
  await page.getByRole('button', { name: 'Approve' }).click(); 
  console.log("Moving to Basket and Checkout!")

  // Basket Review
  await page.getByRole('button', { name: 'Go to checkout' }).click();
  await page.waitForTimeout(3000);

  // Payment
  await page.getByLabel('Select payment method').selectOption('invoice');
  console.log("Invoice is selected. Please press Submit to Continue!")
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(3000);
  
  // Customer Onboarding Verification
  console.log('Verifying Newly Created Customer Onboarding.')
  await page.getByRole('textbox', { name: 'Type Customer name' }).fill(uniqueGivenName);
  await page.locator('button[name="submit-search"]').click();
  
  //Customer Status Check ////////////////////////////////////////////////////////////////////////////////  Application Issue Check 
  console.log('Waiting for 3 mins for status change from Pending to Active...');
  await new Promise(resolve => setTimeout(resolve, 240000));
  await page.reload();

  // Overview Page
  console.log('Waiting for the "Active" status to appear...');
  await page.reload();
  await page.locator('sct-key-value div').nth(3).click();
  console.log('"Active" status is now visible.');
 
  // Product Page Navigation and Validation
  console.log('Verifying the Active status in the product page...');
  await page.getByRole('link', { name: ' Products' }).click();
  await page.locator('sct-key-value div').filter({ hasText: 'Active' }).nth(3).click();
  console.log('Verified the Active status in the product page.');

  // Custom Order Status Verification
  await page.getByRole('link', { name: ' Orders' }).click();
  console.log('Welcome to Orders Tab! Checking Order Status...... ');
  await page.waitForTimeout(3000);
  const orderStatusElement = page.getByText('Completed').first()
  const statusText = await orderStatusElement.innerText();
  if (statusText.includes("Completed")) {
    console.log('Order Completed');
  } else if (statusText.includes("On Hold")) {
      throw new Error("Order Status is On Hold, requires investigation.");
  } else {
      throw new Error("Order status unknown.");
  }
});

