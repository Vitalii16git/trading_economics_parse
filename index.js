const puppeteer = require("puppeteer");

const parsePage = async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto("https://tradingeconomics.com/calendar");

  const dropDownStarsSelector =
    '.btn-group:nth-child(2) button[data-toggle="dropdown"]';
  const threeStarsSelector =
    "#aspnetForm td:nth-child(1) div.btn-group:nth-child(2) > ul > li:nth-child(3) > a";
  const dropDownMonthSelector =
    ".btn-group-calendar > .btn-group:first-child button";
  const currentMonthSelector = "li:nth-child(6) a[onclick]";
  const nextMonthSelector = "li:nth-child(7) a[onclick]";

  // Wait for the button to appear
  await page.waitForSelector(dropDownStarsSelector);
  await page.click(dropDownStarsSelector);

  // Wait for the button to appear
  await page.waitForSelector(threeStarsSelector);
  await page.click(threeStarsSelector);

  const months = ["currentMonth", "nextMonth"];

  // Wait for the button to appear
  await page.waitForSelector(dropDownMonthSelector);
  await page.click(dropDownMonthSelector);

  const monthsArray = months.map(async (month) => {
    if (month === "currentMonth") {
      // Wait for the button to appear
      await page.waitForSelector(currentMonthSelector);
      await page.click(currentMonthSelector);

      return { [month]: await getEvents(page) };
    }
    if (month === "nextMonth") {
      // Wait for the button to appear
      await page.waitForSelector(nextMonthSelector);
      await page.click(nextMonthSelector);

      return { [month]: await getEvents(page) };
    }
  });

  const resolvedMonths = await Promise.all(monthsArray);
  await resolvedMonths.map((month) => {
    console.log(JSON.stringify(month));
    return JSON.stringify(month);
  });

  console.log(resolvedMonths);
  return resolvedMonths;
};

const getEvents = async (page) => {
  const eventHandles = await page.$$("#calendar tr[data-id]");

  const eventsArray = eventHandles.map(async (eventHandle) => {
    const [hour, country, event, event_link] = await Promise.all([
      page.evaluate(
        (hour) => hour.querySelector(".calendar-date-3").textContent.trim(),
        eventHandle
      ),
      page.evaluate(
        (country) => country.querySelector(".calendar-iso").textContent.trim(),
        eventHandle
      ),
      page.evaluate(
        (event) => event.querySelector("a.calendar-event").textContent.trim(),
        eventHandle
      ),
      page.evaluate(
        (event_link) =>
          event_link.querySelector("a.calendar-event").getAttribute("href"),
        eventHandle
      ),
    ]);

    return {
      hour,
      country,
      event,
      event_link: event_link
        ? `https://tradingeconomics.com${event_link}`
        : null,
    };
  });

  const result = await Promise.all(eventsArray);
  return result;
};

parsePage();
