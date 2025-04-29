import { Request, Response } from 'express';
import { getDriver, fetchCertificationsForLssId } from './lssScraper.js';

export const getCertifications = async (req: Request, res: Response) => {
  const { lssId } = req.body;
  if (!lssId) {
    return res.status(400).json({ error: 'Missing lssId in request body' });
  }
  let driver;
  try {
    driver = await getDriver();
    const result = await fetchCertificationsForLssId(driver, lssId);
    if (!result) {
      return res.status(404).json({ error: 'No certifications found or failed to fetch.' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certifications', details: error });
  } finally {
    if (driver) await driver.quit();
  }
}; 