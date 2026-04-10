```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Joi = require('joi');
const apiKeyAuth = require('./apiKeyAuth');

const app = express();
app.use(express.json());
app.use(cors());

// Validate API key
app.use(apiKeyAuth);

// LinkedIn API endpoint URL
const linkedInApiUrl = 'https://api.linkedin.com/v2/jobs';

// Define schema for input validation
const jobTitleSchema = Joi.string().required().trim().label('Job Title');

// API endpoint to get job salary insights
app.post('/job-insights', async (req, res) => {
    try {
        // Validate job title
        const { error } = jobTitleSchema.validate(req.body.jobTitle);
        if (error) {
            return res.status(400).json({ success: false, error: 'validation_error', message: error.message });
        }

        // Set LinkedIn API parameters
        const jobTitle = req.body.jobTitle;
        const params = {
            'q': jobTitle,
            'fields': 'list(id,title,description,salary,skills)'
        };

        // Make request to LinkedIn API
        const response = await axios.get(linkedInApiUrl, {
            params: params,
            headers: {
                'Authorization': `Bearer ${process.env.LINKEDIN_API_KEY}`
            }
        });

        // Extract job insights from response data
        const jobId = response.data.values[0].id;
        const jobTitle = response.data.values[0].title;
        const jobDescription = response.data.values[0].description;
        const salaryRange = response.data.values[0].salary;
        const requiredSkills = response.data.values[0].skills;

        // Return job insights
        res.json({ success: true, data: { jobTitle, jobDescription, salaryRange, requiredSkills } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'internal_server_error', message: 'Failed to retrieve job insights' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'not_found', message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'internal_server_error', message: 'Internal server error' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
```


// Middlewares
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ success: false, error: 'unauthorized', message: 'Invalid API key' });
    }
    next();
};