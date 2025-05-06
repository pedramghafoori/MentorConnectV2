import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';

export interface Award {
  name: string | null;
  issued: string | null;
  expiry: string | null;
  daysLeft: number | null;
}

export async function getDriver(): Promise<Browser> {
  console.log('Initializing Puppeteer...');
  console.log('Environment:', process.env.NODE_ENV);
  
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  };
  
  const browser = await puppeteer.launch(launchOptions);
  console.log('Puppeteer initialized successfully');
  return browser;
}

export async function parseAwardsFromTable(page: Page): Promise<Award[]> {
  const detailedAwards: Award[] = [];
  try {
    const rows = await page.$$('table tr');
    console.log('\n=== Raw Awards Data from LSS Website ===');
    
    for (const row of rows) {
      const tds = await row.$$('td');
      if (tds.length !== 3) continue;
      
      const issuedStr = await tds[0].evaluate((el: Element) => el.textContent?.trim() || '');
      const expiryStr = await tds[1].evaluate((el: Element) => el.textContent?.trim() || '');
      const awardStr = await tds[2].evaluate((el: Element) => el.textContent?.trim() || '');
      
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

export async function fetchCertificationsForLssId(browser: Browser, lssId: string): Promise<{ name: string, awards: Award[] } | null> {
  console.log(`\n=== Fetching certifications for LSS ID: ${lssId} ===`);
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.lifesavingsociety.com/find-a-member.aspx');
    
    // Fill in LSS ID
    await page.type('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CustomerCodeTextBox', lssId);
    
    // Set dropdown to 'All Certifications'
    await page.select('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_DropDownList1', 'All Certifications');
    console.log('Selected "All Certifications" from dropdown');
    
    // Click GetCertifications
    await page.click('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_GetCertificationsButton');
    
    // Wait for results
    await page.waitForSelector('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView', { timeout: 10000 });
    
    // Parse name
    let foundName = 'Unknown';
    try {
      const nameText = await page.$eval('p:has(label:text("Re:"))', (el: Element) => el.textContent?.trim() || '');
      if (nameText.includes('Re:')) {
        const possibleName = nameText.split('Re:', 2)[1].trim();
        if (possibleName) foundName = possibleName;
      }
    } catch {}
    
    // Parse awards
    const awards = await parseAwardsFromTable(page);
    console.log('\n=== Processed Awards Summary ===');
    console.log(JSON.stringify(awards, null, 2));
    console.log('=== End of Processed Awards ===\n');
    
    await page.close();
    return { name: foundName, awards };
  } catch (err) {
    console.error('Error fetching certifications:', err);
    await page.close();
    return null;
  }
} 