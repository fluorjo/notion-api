import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import request from "request";
dotenv.config();

const wakatimeApiKey = process.env.WAKATIME_API_KEY;
const weekNumber = () => {
  currentdate = new Date();
  var oneJan = new Date(currentdate.getFullYear(), 0, 1);
  var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
};

const getMonday = (d) => {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const today = new Date();
const monday = getMonday(today);

const todayString = today.toISOString();
const mondayString = monday.toISOString();

const startDate = mondayString.split("T");
const endDate = todayString.split("T");

const wakaURL = `https://wakatime.com/api/v1/users/current/summaries?start=${startDate[0]}&end=${endDate[0]}&api_key=${wakatimeApiKey}`;
//-------------//
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = "8e70205e92e747b6b16d47583c4bd62f";

async function main() {
  request(wakaURL, async function (err, res, body) {
    const jsonBody = JSON.parse(body);
    // console.log(jsonBody);
    for (let project in jsonBody.data[0].projects) {
      const projectName = jsonBody.data[0].projects[project].name;
      const time = jsonBody.data[0].projects[project].digital;
      const time2String = time.toString();
      console.log(projectName);
      try {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            Title: {
              title: [
                {
                  text: {
                    content: projectName,
                  },
                },
              ],
            },

            time: {
                rich_text: [
                {
                  text: {
                    content: time2String,
                  },
                },
              ],
            },
          },
        });
        // console.log(response)
        // console.log("Success! Entry added.")
      } catch (error) {
        console.error(error.body);
      }
    }
  });
}
main();