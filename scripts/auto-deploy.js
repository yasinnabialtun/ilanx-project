const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const USERNAME = 'ynad6503';
const PASSWORD = '+YUi5Cks9g-X';

async function run() {
  console.log("🚀 Starting cPanel Clean Reinstallation (Anti-Bot Bypass)...");
  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 1. Go to cPanel login
    console.log("🌐 Navigating to cPanel login...");
    await page.goto('https://mt-hermes.guzelhosting.com:2083/', { waitUntil: 'networkidle2' });

    // 2. Perform Login
    console.log("🔑 Checking for privacy consent / clickthrough notices...");
    try {
      const clickthroughBtn = await page.$('.clickthrough-cont-btn, button.clickthrough-cont-btn');
      if (clickthroughBtn) {
        console.log("Consent button found! Clicking it first...");
        await clickthroughBtn.click();
        await new Promise(r => setTimeout(r, 3000));
      } else {
        console.log("No consent notice detected.");
      }
    } catch (e) {
      console.log("Error checking for consent button:", e.message);
    }

    console.log("🔑 Automating login (Direct JS Injection)...");
    await page.waitForSelector('#user', { timeout: 15000 });
    await page.waitForSelector('#pass', { timeout: 15000 });

    // Inject values directly to avoid focus stealing during consent notice transition
    await page.$eval('#user', (el, val) => { el.value = val; }, USERNAME);
    await page.$eval('#pass', (el, val) => { el.value = val; }, PASSWORD);

    // Trigger input/change events to update form states
    await page.$eval('#user', el => el.dispatchEvent(new Event('input', { bubbles: true })));
    await page.$eval('#pass', el => el.dispatchEvent(new Event('input', { bubbles: true })));
    await page.$eval('#user', el => el.dispatchEvent(new Event('change', { bubbles: true })));
    await page.$eval('#pass', el => el.dispatchEvent(new Event('change', { bubbles: true })));

    console.log("⏳ Letting page settle before click...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("📸 Saving screenshot before click to verify values...");
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    console.log("🖱️ Clicking login button...");
    await page.click('#login_submit');

    console.log("⏳ Waiting for cPanel dashboard redirection...");
    let cpsess = '';
    let loggedIn = false;
    for (let k = 0; k < 12; k++) {
      await new Promise(r => setTimeout(r, 2000));
      const url = page.url();
      console.log(`[URL Check] Current URL: ${url}`);
      const cpsessMatch = url.match(/(cpsess\w+)/);
      if (cpsessMatch) {
        cpsess = cpsessMatch[1];
        console.log(`✅ Logged in successfully! Session ID: ${cpsess}`);
        loggedIn = true;
        break;
      }
      if (url.includes('/index.html') || url.includes('/home/')) {
        console.log("✅ Logged in.");
        loggedIn = true;
        break;
      }
    }

    if (!loggedIn) {
      console.log("⚠️ Could not verify login within 24s. Checking screen...");
      await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
    }

    // 3. Delete existing Node.js App
    console.log("🖥️ Navigating to Setup Node.js App to delete old app...");
    const nodeAppUrl = cpsess
      ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/jupiter/nodeapp/index.html`
      : `https://mt-hermes.guzelhosting.com:2083/frontend/jupiter/nodeapp/index.html`;
    await page.goto(nodeAppUrl, { waitUntil: 'networkidle2' }).catch(async () => {
      const fallbackUrl = cpsess
        ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/paper_lantern/nodeapp/index.html`
        : `https://mt-hermes.guzelhosting.com:2083/frontend/paper_lantern/nodeapp/index.html`;
      await page.goto(fallbackUrl, { waitUntil: 'networkidle2' });
    });

    console.log("🔍 Checking for existing application to delete...");
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    const deletedNode = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        if (row.textContent.includes('tsukodesign.com') || row.textContent.includes('ilanx')) {
          const deleteBtn = row.querySelector('i.fa-trash, i.fa-trash-o, button[title="Delete"], button.delete-btn, span[title="Delete"]');
          if (deleteBtn) {
            deleteBtn.click();
            return true;
          }
          // fallback click any delete button in the row
          const allButtons = Array.from(row.querySelectorAll('button, a, i, span'));
          for (const btn of allButtons) {
            if (btn.className?.includes('trash') || btn.title?.includes('Delete') || btn.textContent?.includes('Delete')) {
              btn.click();
              return true;
            }
          }
        }
      }
      return false;
    });

    if (deletedNode) {
      console.log("🗑️ Clicked delete button for Node.js app. Waiting for confirmation dialog...");
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
      
      // Click confirm delete button
      await page.evaluate(() => {
        const confirmBtn = document.querySelector('.modal-dialog button[id*="confirm"], .modal-dialog button[class*="confirm"], button.btn-danger, button.btn-primary');
        if (confirmBtn) confirmBtn.click();
        const dialogBtns = Array.from(document.querySelectorAll('button'));
        for (const btn of dialogBtns) {
          if (btn.textContent.includes('Agree') || btn.textContent.includes('Delete') || btn.textContent.includes('OK') || btn.textContent.includes('Confirm')) {
            btn.click();
            break;
          }
        }
      });
      console.log("✅ Deleting Node app confirmed. Waiting 5 seconds...");
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log("ℹ️ No existing Node.js application found to delete.");
    }

    // 4. Delete existing Git Repository
    console.log("📂 Navigating to Git Version Control to delete old repo...");
    const gitUrl = cpsess
      ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/jupiter/git/index.html`
      : `https://mt-hermes.guzelhosting.com:2083/frontend/jupiter/git/index.html`;
    
    await page.goto(gitUrl, { waitUntil: 'networkidle2' }).catch(async () => {
      const fallbackUrl = cpsess 
        ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/paper_lantern/git/index.html`
        : `https://mt-hermes.guzelhosting.com:2083/frontend/paper_lantern/git/index.html`;
      await page.goto(fallbackUrl, { waitUntil: 'networkidle2' });
    });

    console.log("🔍 Checking for existing Git repository to delete...");
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    const manageBtnClicked = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        if (row.textContent.includes('ilanx-project') || row.textContent.includes('ilanx_canli')) {
          const manageBtn = row.querySelector('a, button');
          if (manageBtn) {
            manageBtn.click();
            return true;
          }
        }
      }
      return false;
    });

    if (manageBtnClicked) {
      console.log("📥 Navigating to Git Manage page to delete repository...");
      await new Promise(r => setTimeout(r, 5000));
      await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

      // Click delete tab or button
      console.log("🗑️ Clicking Delete Repository button...");
      const deleteClicked = await page.evaluate(() => {
        // Go to delete tab or click delete button
        const buttons = Array.from(document.querySelectorAll('button, a'));
        for (const btn of buttons) {
          if (btn.textContent.includes('Delete') || btn.textContent.includes('Remove')) {
            btn.click();
            return true;
          }
        }
        return false;
      });

      if (deleteClicked) {
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
        
        // Confirm delete and check checkbox to delete working directory if available
        await page.evaluate(() => {
          const checkbox = document.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.click(); // Delete the directory files too!
          
          const confirmBtn = document.querySelector('button.btn-danger, button.btn-primary');
          if (confirmBtn) confirmBtn.click();
          
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const btn of buttons) {
            if (btn.textContent.includes('Delete') || btn.textContent.includes('Confirm') || btn.textContent.includes('Remove')) {
              btn.click();
              break;
            }
          }
        });
        console.log("✅ Deleting Git repo confirmed. Waiting 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));
      }
    } else {
      console.log("ℹ️ No existing Git repository found to delete.");
    }

    // 5. Create new Git Repository directly in /home/ynad6503/ilanx_canli
    console.log("📂 Creating fresh Git Repository in app directory...");
    const gitCreateUrl = cpsess
      ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/jupiter/git/create.html`
      : `https://mt-hermes.guzelhosting.com:2083/frontend/jupiter/git/create.html`;
    await page.goto(gitCreateUrl, { waitUntil: 'networkidle2' }).catch(async () => {
      const fallbackUrl = cpsess
        ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/paper_lantern/git/create.html`
        : `https://mt-hermes.guzelhosting.com:2083/frontend/paper_lantern/git/create.html`;
      await page.goto(fallbackUrl, { waitUntil: 'networkidle2' });
    });

    console.log("📝 Filling Git clone form...");
    await page.waitForSelector('input[name="clone_url"]', { timeout: 10000 });
    
    // Fill Clone URL
    await page.focus('input[name="clone_url"]');
    await page.type('input[name="clone_url"]', 'https://github.com/yasinnabialtun/ilanx-project.git');

    // Fill Repository Path
    await page.focus('input[name="repository_path"]');
    await page.click('input[name="repository_path"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="repository_path"]', '/home/ynad6503/ilanx_canli');

    // Fill Repository Name
    await page.focus('input[name="repository_name"]');
    await page.click('input[name="repository_name"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="repository_name"]', 'ilanx-project');

    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    console.log("🖱️ Clicking Create Git Repository button...");
    const createGitBtn = await page.waitForSelector('#submit, button[type="submit"], input[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      createGitBtn.click()
    ]);

    console.log("✅ Git Repository created successfully!");
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    // 6. Create new Node.js App
    console.log("🖥️ Navigating to Setup Node.js App to create fresh app...");
    const nodeAppCreateUrl = cpsess
      ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/jupiter/nodeapp/create.html`
      : `https://mt-hermes.guzelhosting.com:2083/frontend/jupiter/nodeapp/create.html`;
    await page.goto(nodeAppCreateUrl, { waitUntil: 'networkidle2' }).catch(async () => {
      const fallbackUrl = cpsess
        ? `https://mt-hermes.guzelhosting.com:2083/${cpsess}/frontend/paper_lantern/nodeapp/create.html`
        : `https://mt-hermes.guzelhosting.com:2083/frontend/paper_lantern/nodeapp/create.html`;
      await page.goto(fallbackUrl, { waitUntil: 'networkidle2' });
    });

    console.log("📝 Filling Node.js App creation form...");
    await page.waitForSelector('select[name="version"], select[id*="version"]', { timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    // Select version 20 and fill application fields
    await page.evaluate(() => {
      // Find Node version select and choose '20'
      const versionSelect = document.querySelector('select[name="version"], select[id*="version"]');
      if (versionSelect) {
        const option20 = Array.from(versionSelect.options).find(opt => opt.value.startsWith('20') || opt.text.startsWith('20'));
        if (option20) {
          versionSelect.value = option20.value;
          versionSelect.dispatchEvent(new Event('change'));
        }
      }

      // Application Mode dropdown -> Production
      const modeSelect = document.querySelector('select[name="env"], select[id*="env"], select[name="mode"]');
      if (modeSelect) {
        modeSelect.value = 'production';
        modeSelect.dispatchEvent(new Event('change'));
      }

      // Application root
      const rootInput = document.querySelector('input[name="app_dir"], input[id*="app_dir"]');
      if (rootInput) {
        rootInput.value = 'ilanx_canli';
        rootInput.dispatchEvent(new Event('input'));
      }

      // Application URL
      const domainSelect = document.querySelector('select[name="domain"], select[id*="domain"]');
      if (domainSelect) {
        const domainOption = Array.from(domainSelect.options).find(opt => opt.text.includes('tsukodesign.com'));
        if (domainOption) {
          domainSelect.value = domainOption.value;
          domainSelect.dispatchEvent(new Event('change'));
        }
      }

      // Application startup file
      const startupInput = document.querySelector('input[name="startup_file"], input[id*="startup_file"]');
      if (startupInput) {
        startupInput.value = 'server.js';
        startupInput.dispatchEvent(new Event('input'));
      }
    });

    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});

    console.log("🖱️ Clicking Create Node.js App button...");
    await page.evaluate(() => {
      const createBtn = document.querySelector('#create_app_submit, button[type="submit"], button.create-btn, input[type="submit"]');
      if (createBtn) createBtn.click();
      const btns = Array.from(document.querySelectorAll('button'));
      for (const btn of btns) {
        if (btn.textContent.includes('Create') || btn.value?.includes('Create')) {
          btn.click();
          break;
        }
      }
    });

    console.log("⏳ Waiting for Node.js app creation to complete...");
    await new Promise(r => setTimeout(r, 12000));
    await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
    console.log("✅ Node.js application created successfully!");

    // 7. Restart Application
    console.log("♻️ Restarting Node.js application to trigger clean webpack build...");
    // Go to edit page if needed, or if it is already there, click restart
    const restartClicked = await page.evaluate(() => {
      const restartBtn = document.querySelector('button[id*="restart"], button[class*="restart"], button[title="Restart"]');
      if (restartBtn) {
        restartBtn.click();
        return true;
      }
      const btns = Array.from(document.querySelectorAll('button'));
      for (const btn of btns) {
        if (btn.textContent.includes('Restart') || btn.title?.includes('Restart')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (restartClicked) {
      console.log("⚡ Restart triggered successfully!");
      await new Promise(r => setTimeout(r, 8000));
    } else {
      console.log("⚠️ Restart button not found, please check current-screen.png");
    }

    // 8. Open site to trigger build
    console.log("🚀 Opening website to start build...");
    const sitePage = await browser.newPage();
    await sitePage.goto('https://www.tsukodesign.com/', { waitUntil: 'networkidle2' });

    let buildFinished = false;
    for (let poll = 0; poll < 40; poll++) {
      console.log(`📡 Checking site status (${poll + 1}/40)...`);
      await new Promise(r => setTimeout(r, 15000));
      try {
        await sitePage.reload({ waitUntil: 'networkidle2' });
        const content = await sitePage.content();
        if (content.includes('Fiyatlandırma') || content.includes('Pricing') || content.includes('Gayrimenkul') || content.includes('gayrimenkul')) {
          console.log("🎉 SUCCESS! Clean build completed and site is live!");
          buildFinished = true;
          break;
        }
      } catch (err) {
        console.log("⏳ Compiling... trying again.");
      }
    }

    if (buildFinished) {
      console.log("🧪 Verifying pricing page...");
      await sitePage.goto('https://www.tsukodesign.com/pricing', { waitUntil: 'networkidle2' });
      console.log("✅ Pricing page loaded successfully!");
      await sitePage.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
    }

    console.log("🎉 Reinstallation complete! Closing in 10 seconds.");
    await new Promise(r => setTimeout(r, 10000));
    await browser.close();

  } catch (error) {
    console.error("❌ Error during reinstallation:", error);
    if (page) {
      await page.screenshot({ path: path.join(__dirname, '..', 'current-screen.png') }).catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

run();
