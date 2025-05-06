import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer-core';

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
    executablePath: "/app/.chrome-for-testing/chrome-linux64/chrome",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  };
  
  console.log('Chrome binary path:', launchOptions.executablePath);
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

export async function scrapeLSSAwards(lssId: string): Promise<{ name: string | null; awards: Award[] }> {
  console.log(`Starting scrape for LSS ID: ${lssId}`);
  const browser = await getDriver();
  const page = await browser.newPage();
  
  try {
    // Navigate to the LSS website
    await page.goto('https://www.lifesavingsociety.com/find-a-member.aspx', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Fill in the LSS ID
    await page.waitForSelector('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CustomerCodeTextBox');
    await page.type('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CustomerCodeTextBox', lssId);

    // Select 'Complete' from dropdown
    await page.waitForSelector('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_DropDownList1');
    await page.select('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_DropDownList1', 'Complete');

    // Click the GetCertifications button
    await page.waitForSelector('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_GetCertificationsButton');
    await page.click('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_GetCertificationsButton');

    // Wait for results container
    try {
      await page.waitForSelector('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView', {
        timeout: 5000
      });
    } catch (error) {
      console.log('No results container found - likely invalid LSS ID');
      return { name: null, awards: [] };
    }

    // Try to get the name from the Re: line
    let name = null;
    try {
      const nameElement = await page.waitForSelector('p:has(label:text("Re:"))', { timeout: 5000 });
      if (nameElement) {
        const nameText = await nameElement.evaluate(el => el.textContent);
        if (nameText && nameText.includes('Re:')) {
          name = nameText.split('Re:')[1].trim();
        }
      }
    } catch (error) {
      console.log('Could not find name element');
    }

    // Get the awards table
    const awards = await page.evaluate(() => {
      const awards: Award[] = [];
      const rows = document.querySelectorAll('#ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView table tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 3) {
          const issued = cells[0].textContent?.trim() || null;
          const expiry = cells[1].textContent?.trim() || null;
          const name = cells[2].textContent?.trim() || null;
          
          let daysLeft = null;
          if (expiry) {
            const expiryDate = new Date(expiry);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
          
          awards.push({ name, issued, expiry, daysLeft });
        }
      });
      
      return awards;
    });

    return { name, awards };
  } catch (error) {
    console.error('Error scraping LSS awards:', error);
    return { name: null, awards: [] };
  } finally {
    await browser.close();
  }
} 