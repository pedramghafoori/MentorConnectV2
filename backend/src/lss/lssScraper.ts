import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Initialize chromedriver
chromedriver.start();

export interface Award {
  name: string | null;
  issued: string | null;
  expiry: string | null;
  daysLeft: number | null;
}

export async function getDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  
  // Always use headless mode in production (Heroku)
  if (process.env.NODE_ENV === 'production') {
    options.addArguments('--headless=new');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-software-rasterizer');
    options.addArguments('--disable-extensions');
    options.addArguments('--single-process');
    options.addArguments('--no-zygote');
    // Use a truly unique user data directory
    const userDataDir = path.join(os.tmpdir(), `chrome-${uuidv4()}`);
    options.addArguments(`--user-data-dir=${userDataDir}`);
  }
  
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export async function parseAwardsFromTable(container: WebElement): Promise<Award[]> {
  const detailedAwards: Award[] = [];
  try {
    const table = await container.findElement(By.tagName('table'));
    let tableBody: WebElement;
    try {
      tableBody = await table.findElement(By.tagName('tbody'));
    } catch {
      tableBody = table;
    }
    const rows = await tableBody.findElements(By.tagName('tr'));
    console.log('\n=== Raw Awards Data from LSS Website ===');
    for (const row of rows) {
      const tds = await row.findElements(By.tagName('td'));
      if (tds.length !== 3) continue;
      const issuedStr = (await tds[0].getText()).trim();
      const expiryStr = (await tds[1].getText()).trim();
      const awardStr = (await tds[2].getText()).trim();
      console.log(`\nAward Details:`);
      console.log(`- Name: ${awardStr}`);
      console.log(`- Issued: ${issuedStr}`);
      console.log(`- Expiry: ${expiryStr}`);
      
      let daysLeft: number | null = null;
      let issueDate: Date | null = null;
      if (issuedStr) {
        try {
          issueDate = new Date(issuedStr);
          console.log(`  Parsed Issue Date: ${issueDate.toISOString()}`);
        } catch (error) {
          console.error(`  Failed to parse issue date: ${issuedStr}`, error);
        }
      }
      if (expiryStr) {
        try {
          const expiryDate = new Date(expiryStr);
          const today = new Date();
          daysLeft = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`  Days until expiry: ${daysLeft}`);
        } catch (error) {
          console.error(`  Failed to parse expiry date: ${expiryStr}`, error);
        }
      }
      detailedAwards.push({
        name: awardStr || null,
        issued: issueDate ? issueDate.toISOString() : null,
        expiry: expiryStr || null,
        daysLeft,
      });
    }
    console.log('\n=== End of Raw Awards Data ===\n');
  } catch (error) {
    console.error('Error parsing awards table:', error);
  }
  return detailedAwards;
}

export async function fetchCertificationsForLssId(driver: WebDriver, lssId: string): Promise<{ name: string, awards: Award[] } | null> {
  console.log(`\n=== Fetching certifications for LSS ID: ${lssId} ===`);
  await driver.get('https://www.lifesavingsociety.com/find-a-member.aspx');
  try {
    // Fill in LSS ID
    const inputBox = await driver.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CustomerCodeTextBox'));
    await inputBox.clear();
    await inputBox.sendKeys(lssId);
    
    // Set dropdown to 'All Certifications'
    const dropdownElem = await driver.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_DropDownList1'));
    await dropdownElem.sendKeys('All Certifications');
    console.log('Selected "All Certifications" from dropdown');
    
    // Click GetCertifications
    const button = await driver.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_GetCertificationsButton'));
    await button.click();
    
    // Wait for results
    await driver.wait(until.elementLocated(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView')), 10000);
    const container = await driver.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView'));
    
    // Parse name
    let foundName = 'Unknown';
    try {
      const nameElem = await driver.findElement(By.xpath("//p[label[text()='Re:']]"));
      const reText = (await nameElem.getText()).trim();
      if (reText.includes('Re:')) {
        const possibleName = reText.split('Re:', 2)[1].trim();
        if (possibleName) foundName = possibleName;
      }
    } catch {}
    
    // Parse awards
    const awards = await parseAwardsFromTable(container);
    console.log('\n=== Processed Awards Summary ===');
    console.log(JSON.stringify(awards, null, 2));
    console.log('=== End of Processed Awards ===\n');
    return { name: foundName, awards };
  } catch (err) {
    console.error('Error fetching certifications:', err);
    return null;
  }
} 