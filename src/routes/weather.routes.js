const express = require("express");
const axios = require("axios");
const { z } = require("zod");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const querySchema = z.object({ city: z.string().min(3) });
    const { city } = querySchema.parse(req.query);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

    const response = await axios.get(url);

    const data = {
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description,
    };

    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) {
      res.status(404).json({ message: "City not found" });
    } else {
      next(err);
    }
  }
});

module.exports = router;
