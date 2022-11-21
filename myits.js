const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { extractColors } = require('extract-colors');
const path = require('path');
const fs = require('fs');
const cherio = require('cheerio');

puppeteer.use(StealthPlugin());

function checkColor(hex) {
  if (hex === '#00ff00' || hex === '#00ff00') {
    const color = 'hijau';
    return color;
  } else if (hex === '#FF7F00' || hex === '#ff7f00') {
    const color = 'oranye';
    return color;
  } else if (hex === '#FF0000' || hex === '#ff0000') {
    const color = 'merah';
    return color;
  } else if (hex === '#4b0082' || hex === '#8f00ff') {
    const color = 'ungu';
    return color;
  } else if (hex === '#0000ff' || hex === '#8f00ff') {
    const color = 'biru';
    return color;
  } else if (hex === '#FFFF00' || hex === '#ffff00') {
    const color = 'kuning';
    return color;
  } else {
    const color = 'nila';
    return color;
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto(
    'https://www.google.com/url?sa=t&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjDxpWyip77AhW0SmwGHWlpAHwQFnoECAwQAQ&url=https%3A%2F%2Fmy.its.ac.id%2F&usg=AOvVaw2eMWHwlcvs5ef75gAthUJN'
  );
  await page.waitForSelector('#username');
  await page.type('#username', '5027211045');
  await page.click('#continue');
  await page.waitForSelector('#password');
  await page.type('#password', '081Sultan');
  await page.click('#login');

  const cookies = await page.cookies();
  var cookie = cookies[2].value;
  console.log(cookie);

  await page.goto('https://id.its.ac.id/otp/auth.php');
  const page2 = await browser.newPage();
  const img = await page2.goto('https://id.its.ac.id/otp/d.php');
  const buffer = await img.buffer();
  fs.writeFileSync('img.png', buffer);
  const src = path.join(__dirname, './img.png');
  const colors = await extractColors(src, { count: 1 }).then(
    (colors) => {
      const hex = colors[0].hex;
      console.log(hex);
      const color = checkColor(hex);
      return color;
    }
  );

  await page.bringToFront();

  await page.select('body > center > form > select', colors);
  await page.click(
    'body > center > form > input[type=submit]:nth-child(7)'
  );
  console.log(colors);
  await page.waitForSelector('.page-header > h1:nth-child(1)');
  await page.goto(
    'https://id.its.ac.id/otp/ndash//index.php/main/showguest'
  );
  const selector = '#pwdlist > tbody > tr';
  const html = await page.content();
  const $ = cherio.load(html);
  var data = [];
  $(selector).each((i, element) => {
    const status = $(element).find('td:nth-child(1)').text();
    var id = $(element).find('td:nth-child(2)').text();
    id = id.split(',');
    const username = id[0].replace('username=', '');

    const pass = id[1].replace('pass= ', '');
    // const proxyLine = $(element).find('td:nth-child(10)').text();
    const obj = {
      status: status,
      username: username,
      pass: pass,
      //   proxyLine: proxyLine,
    };
    data.push(obj);
  });
  console.log(data);
  await browser.close();
})();
