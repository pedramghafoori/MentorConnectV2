import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

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
  // Use headless Chrome in production, visible in dev
  if (process.env.NODE_ENV === 'production') {
    options.addArguments('--headless');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-gpu');
  }
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export async function parseAwardsFromTable(table: WebElement, isCoursesTable: boolean): Promise<Award[]> {
  const detailedAwards: Award[] = [];
  try {
    let tableBody: WebElement;
    try {
      tableBody = await table.findElement(By.tagName('tbody'));
    } catch {
      tableBody = table;
    }
    const rows = await tableBody.findElements(By.tagName('tr'));
    console.log(`Found ${rows.length} rows in table`);

    for (const row of rows) {
      const tds = await row.findElements(By.xpath('./td | ./th'));
      // Skip header rows (where first cell is a <th>)
      if (tds.length === 0 || (await tds[0].getTagName()) === 'th') {
        continue;
      }
      // Handle both 2-column (courses) and 3-column (awards) tables
      if (tds.length !== 2 && tds.length !== 3) {
        console.log('Skipping row - incorrect number of columns');
        continue;
      }
      let issuedStr = '';
      let expiryStr = '';
      let awardStr = '';
      if (isCoursesTable && tds.length === 2) {
        // For courses table: [Course Date, Award]
        issuedStr = (await tds[0].getText()).trim();
        awardStr = (await tds[1].getText()).trim();
        // Normalize old course names to new
        if (awardStr === 'Exam Standards clinic') {
          awardStr = 'Examiner Course';
        } else if (awardStr === 'Trainer Course') {
          awardStr = 'Instructor Trainer Course';
        }
      } else if (tds.length === 3) {
        // For awards table: [Issued, Expiry, Award]
        issuedStr = (await tds[0].getText()).trim();
        expiryStr = (await tds[1].getText()).trim();
        awardStr = (await tds[2].getText()).trim();
      }
      console.log(`Found ${isCoursesTable ? 'course' : 'award'}: ${awardStr}`);
      let daysLeft: number | null = null;
      let issueDate: Date | null = null;
      if (issuedStr) {
        try {
          issueDate = new Date(issuedStr);
        } catch (error) {
          // Ignore date parsing errors
        }
      }
      if (expiryStr) {
        try {
          const expiryDate = new Date(expiryStr);
          const today = new Date();
          daysLeft = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } catch (error) {
          // Ignore date parsing errors
        }
      }
      detailedAwards.push({
        name: awardStr || null,
        issued: issueDate ? issueDate.toISOString() : null,
        expiry: expiryStr || null,
        daysLeft,
      });
    }
    console.log(`\nSuccessfully processed ${detailedAwards.length} ${isCoursesTable ? 'courses' : 'awards'}`);
  } catch (error) {
    console.error('Error parsing table:', error);
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
        if (possibleName) {
          foundName = possibleName;
          console.log(`Found name: ${foundName}`);
        }
      }
    } catch (error) {
      console.log('Failed to parse name, using default');
    }
    // Parse awards table
    let awards: Award[] = [];
    try {
      const awardsTable = await container.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView_AwardsListView_itemPlaceholderContainer'));
      awards = await parseAwardsFromTable(awardsTable, false);
    } catch (error) {
      console.log('No awards table found or error parsing awards');
    }
    // Parse courses table
    let courseAwards: Award[] = [];
    try {
      const coursesTable = await container.findElement(By.id('ContentPlaceHolderDefault_MainContentPlaceHolder_BodyCopyPlaceHolder_Item2_GetCertificationsForMember_5_CertificationResultsFormView_CoursesListView_itemPlaceholderContainer'));
      courseAwards = await parseAwardsFromTable(coursesTable, true);
    } catch (error) {
      console.log('No courses table found or error parsing courses');
    }
    // Merge results
    const allAwards = [...awards, ...courseAwards];
    console.log(`\nTotal awards (including courses): ${allAwards.length}`);
    return { name: foundName, awards: allAwards };
  } catch (err) {
    console.error('Error fetching certifications:', err);
    return null;
  }
} 