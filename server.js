import express from "express";
import cors from "cors";
import axios from "axios";
import qs from "qs";
import SpotifyWebApi from "spotify-web-api-node";
import fs from "fs";
import path from "path";

// Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get the Auth Token
async function getToken() {
  let requestBody = {
    grant_type: "refresh_token",
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  let requestHeaders = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  };

  return axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify(requestBody),
      requestHeaders
    )
    .then((response) => {
      return response.data.access_token;
    })
    .catch((error) => console.log(error));
}

// current song name
app.get("/nowPlaying/text", async (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  const token = await getToken();
  const spotify = new SpotifyWebApi();
  spotify.setAccessToken(token);
  spotify.getMyCurrentPlaybackState().then(
    async function (data) {
      let svg = "";
      if (data.body && data.body.is_playing) {
        const song = data.body.item;
        const name = song.name;
        const artists = [];
        song.artists.forEach((artist) => {
          artists.push(artist.name);
        });

        svg = `
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" style="color:white;">
            <text y="32" style="font: bold 20px sans-serif;">${name}</text>
            <text y="52" style="font: 14px sans-serif;">${artists.toString()}</text>
          </svg>
          `;
      } else {
        svg = `
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" style="color:white;">
          <text y="32" style="font: bold 20px sans-serif;">Nothing...</text>
        </svg>
        `;
      }
      res.send(svg);
    },
    function (err) {
      console.log(err);
    }
  );
});

// current song image
app.get("/nowPlaying/image", async (req, res) => {
  const token = await getToken();
  const spotify = new SpotifyWebApi();
  spotify.setAccessToken(token);
  spotify.getMyCurrentPlaybackState().then(
    async function (data) {
      let image =
        "https://media1.tenor.com/images/2c37320a726330f6a2ae249e60e7056c/tenor.gif?itemid=5752969";
      if (data.body && data.body.is_playing) {
        const song = data.body.item;
        image = song.album.images[0].url;
      }
      res.redirect(image);
    },
    function (err) {
      console.log(err);
    }
  );
});

// current song url
app.get("/nowPlaying/url", async (req, res) => {
  const token = await getToken();
  const spotify = new SpotifyWebApi();
  spotify.setAccessToken(token);
  spotify.getMyCurrentPlaybackState().then(
    async function (data) {
      let url = "";
      if (data.body && data.body.is_playing) {
        const song = data.body.item;
        url = song.external_urls.spotify;
      }
      res.redirect(url);
    },
    function (err) {
      console.log(err);
    }
  );
});

// for 404
app.use("*", (req, res) => res.json({ error: "error" }));

// exporting the App
export default app;
