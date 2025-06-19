import "dotenv/config";
import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";
import express from "express";

const app = express();
app.listen(process.env.port || 9000, () => {
  if (process.env.NODE_ENV == "development") {
    console.log(
      `Server is running on port ${process.env.port || 9000} and environment is ${process.env.NODE_ENV}`,
    );
  }
});

app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      }
    },
  }),
);

app.get("/", statsCard);
app.get("/pin", repoCard);
app.get("/top-langs", langCard);
app.get("/wakatime", wakatimeCard);
app.get("/gist", gistCard);
app.get("/render-html", (req, res) => {
  res.write(
    `
    <div>
    <style>
    div{
    animation:bounce 2s infinite;
    height: 100px;
    width: 100px;
    background-color: #4CAF50;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    </style>
    <div>Hello World</div>
    </div>
    `,
  );
  return res.end();
});
